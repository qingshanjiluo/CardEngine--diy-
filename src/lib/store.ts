// src/lib/store.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import React from 'react';
import { Project, RuntimeState, GameElement, Block, Player } from '@/types';
import { generateId, deepClone, initializeGridSlots, initializePublicArea } from './utils';
import { initRuntime, getRuntime, destroyRuntime, GameRuntimeImpl } from './runtime';
import { BlockInterpreter, EventSystem, createExecutionContext } from './interpreter';

interface StoreState {
  project: Project;
  runtime: RuntimeState;
  selectedElement: string | null;
  selectedBlock: string | null;
  activeScriptTab: 'global' | 'element';
  currentPage: 'dashboard' | 'editor' | 'preview' | 'export' | 'settings';
  // Execution state
  execution: {
    isExecuting: boolean;
    currentBlockId: string | null;
    executingBlockIds: Set<string>;
    lastError: string | null;
  };
  // Undo/Redo history
  history: {
    past: Project[];  // 历史记录（撤销栈）
    future: Project[]; // 重做栈
    maxSize: number;
  };
}

interface StoreActions {
  // Project actions
  setProject: (project: Project) => void;
  updateProjectSettings: (settings: Partial<Project['settings']>) => void;
  
  // Undo/Redo actions
  recordHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Local storage actions
  saveProject: (name?: string) => void;
  loadProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  getRecentProjects: () => Array<{
    id: string;
    name: string;
    lastModified: number;
    project: Project;
  }>;
  
  // Element actions
  addElement: (element: Omit<GameElement, 'id'>) => void;
  updateElement: (id: string, updates: Partial<GameElement>) => void;
  deleteElement: (id: string) => void;
  setSelectedElement: (id: string | null) => void;
  
  // Deck management actions
  addCardToDeck: (deckId: string, cardId: string, quantity?: number) => void;
  removeCardFromDeck: (deckId: string, cardId: string) => void;
  updateCardQuantityInDeck: (deckId: string, cardId: string, quantity: number) => void;
  getDeckCards: (deckId: string) => { card: GameElement; quantity: number }[];
  shuffleDeck: (deckId: string) => string[]; // 返回洗牌后的卡牌实例ID列表
  drawCardsFromDeck: (deckId: string, count: number) => string[]; // 抽取指定数量的卡牌
  
  // Prop management actions
  updatePropUseCount: (propId: string, useCount: number) => void;
  resetPropUseCount: (propId: string) => void;
  
  // Card management actions
  duplicateCard: (cardId: string, quantity?: number) => void;
  
  // Block actions
  addBlock: (block: Omit<Block, 'id'>, target?: 'global' | 'element') => void;
  addChildBlock: (parentId: string, block: Omit<Block, 'id'>) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (blockId: string) => void;
  setSelectedBlock: (id: string | null) => void;
  setActiveScriptTab: (tab: 'global' | 'element') => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  
  // Runtime actions
  startGame: () => Promise<void>;
  pauseGame: () => void;
  resetGame: () => void;
  endTurn: () => Promise<void>;
  moveElementToSlot: (elementId: string, slot: number | null) => void;
  setDraggingElement: (id: string | null) => void;
  addLog: (type: RuntimeState['logs'][0]['type'], message: string) => void;
  setExecutionSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  
  // Execution actions
  triggerEvent: (eventType: string, eventData?: any) => Promise<void>;
  executeGlobalScript: () => Promise<void>;
  executeElementScript: (elementId: string) => Promise<void>;
  stepExecution: () => Promise<void>;  // 单步执行
  setExecutingBlock: (blockId: string | null) => void;
  addExecutingBlock: (blockId: string) => void;
  removeExecutingBlock: (blockId: string) => void;
  clearExecutionState: () => void;
  setExecutionError: (error: string | null) => void;
  
  // Navigation
  setCurrentPage: (page: StoreState['currentPage']) => void;
  
  // Import/Export
  exportProject: (format: 'json' | 'html') => string;
  importProject: (json: string) => void;
  
  // Runtime access
  getRuntime: () => GameRuntimeImpl | null;
}

const defaultProject: Project = {
  name: '未命名桌游',
  author: '最中幻想',
  version: '1.0',
  settings: {
    playersCount: 2,
    gridRows: 3,
    gridCols: 5,
    background: { type: 'solid', value: '#FAFAFA' },
    gridStyle: 'dots',
    playerColors: ['#5686FE', '#10B981', '#F59E0B', '#EF4444'],
    publicAreaEnabled: true,
    slotNames: {},
  },
  elements: [
    {
      id: generateId(),
      name: '主牌堆',
      type: 'deck',
      properties: {},
      script: [],
      face: 'front',
      visible: true,
    },
    {
      id: generateId(),
      name: '士兵',
      type: 'card',
      image: 'https://api.dicebear.com/7.x/identicon/svg?seed=soldier',
      backImage: 'https://api.dicebear.com/7.x/identicon/svg?seed=back',
      properties: {
        attack: { type: 'number', value: 2, label: '攻击力' },
        defense: { type: 'number', value: 1, label: '防御力' },
      },
      script: [],
      face: 'front',
      visible: true,
    }
  ],
  gridSlots: initializeGridSlots(3, 5, 2, true), // gridRows, gridCols, playersCount, publicAreaEnabled
  publicArea: initializePublicArea(),
  players: [
    {
      id: 'p1',
      name: '玩家 1',
      color: '#5686FE',
      type: 'human',
      handCards: [],
      stats: [
        { key: 'hp', name: '生命值', defaultValue: 30 },
        { key: 'gold', name: '金币', defaultValue: 0, suffix: 'G' },
      ],
      properties: {
        hp: { type: 'number', value: 30, label: '生命值' },
      },
      isActive: true,
      variables: {},
    },
    {
      id: 'p2',
      name: '玩家 2',
      color: '#10B981',
      type: 'ai',
      handCards: [],
      stats: [
        { key: 'hp', name: '生命值', defaultValue: 30 },
        { key: 'gold', name: '金币', defaultValue: 0, suffix: 'G' },
      ],
      properties: {
        hp: { type: 'number', value: 30, label: '生命值' },
      },
      isActive: false,
      variables: {},
    },
  ],
  globalScript: [],
  variables: { turnCount: { type: 'number', value: 0 } },
  lists: { discardPile: { items: [], type: 'string' } },
};

const defaultRuntime: RuntimeState = {
  isPlaying: false,
  isPaused: false,
  speed: 'normal',
  currentPlayerIndex: 0,
  currentPlayer: 'p1',
  turnCount: 0,
  phase: 'setup',
  logs: [],
  gridState: { 0: 'deck-main' },
  draggingElement: null,
  players: {
    p1: { id: 'p1', stats: { hp: 30, gold: 0 }, handCards: [] },
    p2: { id: 'p2', stats: { hp: 30, gold: 0 }, handCards: [] },
  },
};

const defaultExecutionState = {
  isExecuting: false,
  currentBlockId: null,
  executingBlockIds: new Set<string>(),
  lastError: null,
};

export const useStore = create<StoreState & StoreActions>()(
  immer((set, get) => ({
    // Initial state
    project: defaultProject,
    runtime: defaultRuntime,
    selectedElement: null,
    selectedBlock: null,
    activeScriptTab: 'global',
    currentPage: 'dashboard',
    execution: defaultExecutionState,
    history: {
      past: [],
      future: [],
      maxSize: 50,
    },

    // Project actions
    setProject: (project) => set({ project }),
    
    updateProjectSettings: (settings) => set((state) => {
      Object.assign(state.project.settings, settings);
    }),
    
    // Undo/Redo actions
    recordHistory: () => set((state) => {
      const { past, maxSize } = state.history;
      const newPast = [...past, deepClone(state.project)];
      // 限制历史记录大小
      if (newPast.length > maxSize) {
        newPast.shift();
      }
      state.history.past = newPast;
      // 当记录新历史时，清空重做栈
      state.history.future = [];
    }),
    
    undo: () => set((state) => {
      const { past, future } = state.history;
      if (past.length === 0) return;
      
      const previous = past[past.length - 1];
      const newPast = past.slice(0, -1);
      const newFuture = [deepClone(state.project), ...future];
      
      state.project = previous;
      state.history.past = newPast;
      state.history.future = newFuture;
    }),
    
    redo: () => set((state) => {
      const { past, future } = state.history;
      if (future.length === 0) return;
      
      const next = future[0];
      const newFuture = future.slice(1);
      const newPast = [...past, deepClone(state.project)];
      
      state.project = next;
      state.history.past = newPast;
      state.history.future = newFuture;
    }),
    
    canUndo: () => {
      const state = get();
      return state.history.past.length > 0;
    },
    
    canRedo: () => {
      const state = get();
      return state.history.future.length > 0;
    },

    // Local storage actions
    saveProject: (name) => {
      const state = get();
      const projectId = `project_${Date.now()}`;
      const projectName = name || state.project.name || '未命名项目';
      const projectData = {
        id: projectId,
        name: projectName,
        lastModified: Date.now(),
        project: state.project
      };
      
      // 保存到localStorage
      try {
        const savedProjects = JSON.parse(localStorage.getItem('cardengine_projects') || '[]');
        const existingIndex = savedProjects.findIndex((p: any) => p.id === projectId);
        
        if (existingIndex >= 0) {
          savedProjects[existingIndex] = projectData;
        } else {
          savedProjects.push(projectData);
        }
        
        // 只保留最近10个项目
        const recentProjects = savedProjects
          .sort((a: any, b: any) => b.lastModified - a.lastModified)
          .slice(0, 10);
        
        localStorage.setItem('cardengine_projects', JSON.stringify(recentProjects));
        localStorage.setItem('cardengine_current_project', JSON.stringify(projectData));
        
        // 添加日志
        set((state) => {
          state.runtime.logs.push({
            type: 'info',
            message: `项目已保存: ${projectName}`,
            timestamp: Date.now()
          });
        });
        
        return projectId;
      } catch (error) {
        console.error('保存项目失败:', error);
        set((state) => {
          state.runtime.logs.push({
            type: 'error',
            message: '保存项目失败',
            timestamp: Date.now()
          });
        });
        return null;
      }
    },

    loadProject: (projectId) => {
      try {
        const savedProjects = JSON.parse(localStorage.getItem('cardengine_projects') || '[]');
        const projectData = savedProjects.find((p: any) => p.id === projectId);
        
        if (projectData) {
          set((state) => {
            state.project = projectData.project;
            state.runtime.logs.push({
              type: 'info',
              message: `项目已加载: ${projectData.name}`,
              timestamp: Date.now()
            });
          });
          
          // 更新当前项目
          localStorage.setItem('cardengine_current_project', JSON.stringify(projectData));
          return true;
        } else {
          set((state) => {
            state.runtime.logs.push({
              type: 'error',
              message: '项目不存在',
              timestamp: Date.now()
            });
          });
          return false;
        }
      } catch (error) {
        console.error('加载项目失败:', error);
        set((state) => {
          state.runtime.logs.push({
            type: 'error',
            message: '加载项目失败',
            timestamp: Date.now()
          });
        });
        return false;
      }
    },

    deleteProject: (projectId) => {
      try {
        const savedProjects = JSON.parse(localStorage.getItem('cardengine_projects') || '[]');
        const filteredProjects = savedProjects.filter((p: any) => p.id !== projectId);
        
        localStorage.setItem('cardengine_projects', JSON.stringify(filteredProjects));
        
        // 如果删除的是当前项目，清除当前项目
        const currentProject = JSON.parse(localStorage.getItem('cardengine_current_project') || 'null');
        if (currentProject && currentProject.id === projectId) {
          localStorage.removeItem('cardengine_current_project');
        }
        
        set((state) => {
          state.runtime.logs.push({
            type: 'info',
            message: '项目已删除',
            timestamp: Date.now()
          });
        });
        
        return true;
      } catch (error) {
        console.error('删除项目失败:', error);
        return false;
      }
    },

    getRecentProjects: () => {
      try {
        const savedProjects = JSON.parse(localStorage.getItem('cardengine_projects') || '[]');
        return savedProjects
          .sort((a: any, b: any) => b.lastModified - a.lastModified)
          .slice(0, 10);
      } catch (error) {
        console.error('获取最近项目失败:', error);
        return [];
      }
    },

    // Element actions
    addElement: (element) => set((state) => {
      // 记录历史
      const { past, maxSize } = state.history;
      const newPast = [...past, deepClone(state.project)];
      if (newPast.length > maxSize) newPast.shift();
      state.history.past = newPast;
      state.history.future = [];
      
      const newElement = { ...element, id: generateId() };
      state.project.elements.push(newElement);
      state.selectedElement = newElement.id;
    }),

    updateElement: (id, updates) => set((state) => {
      // 记录历史
      const { past, maxSize } = state.history;
      const newPast = [...past, deepClone(state.project)];
      if (newPast.length > maxSize) newPast.shift();
      state.history.past = newPast;
      state.history.future = [];
      
      const element = state.project.elements.find(e => e.id === id);
      if (element) Object.assign(element, updates);
    }),

    deleteElement: (id) => set((state) => {
      // 记录历史
      const { past, maxSize } = state.history;
      const newPast = [...past, deepClone(state.project)];
      if (newPast.length > maxSize) newPast.shift();
      state.history.past = newPast;
      state.history.future = [];
      
      state.project.elements = state.project.elements.filter(e => e.id !== id);
      if (state.selectedElement === id) state.selectedElement = null;
      // 同时从所有牌堆中移除该卡牌
      state.project.elements.forEach(el => {
        if (el.type === 'deck' && el.deckContent?.cards) {
          el.deckContent.cards = el.deckContent.cards.filter(c => c.cardId !== id);
        }
      });
    }),

    setSelectedElement: (id) => set({ selectedElement: id }),

    // Deck management actions
    addCardToDeck: (deckId, cardId, quantity = 1) => set((state) => {
      const deck = state.project.elements.find(e => e.id === deckId && e.type === 'deck');
      if (!deck) return;
      
      if (!deck.deckContent) {
        deck.deckContent = { cards: [] };
      }
      
      const existingEntry = deck.deckContent.cards.find(c => c.cardId === cardId);
      if (existingEntry) {
        existingEntry.quantity += quantity;
      } else {
        deck.deckContent.cards.push({ cardId, quantity });
      }
    }),

    removeCardFromDeck: (deckId, cardId) => set((state) => {
      const deck = state.project.elements.find(e => e.id === deckId && e.type === 'deck');
      if (deck?.deckContent?.cards) {
        deck.deckContent.cards = deck.deckContent.cards.filter(c => c.cardId !== cardId);
      }
    }),

    updateCardQuantityInDeck: (deckId, cardId, quantity) => set((state) => {
      const deck = state.project.elements.find(e => e.id === deckId && e.type === 'deck');
      if (!deck?.deckContent?.cards) return;
      
      const entry = deck.deckContent.cards.find(c => c.cardId === cardId);
      if (entry) {
        entry.quantity = Math.max(0, quantity);
        if (entry.quantity === 0) {
          deck.deckContent.cards = deck.deckContent.cards.filter(c => c.cardId !== cardId);
        }
      }
    }),

    getDeckCards: (deckId) => {
      const state = get();
      const deck = state.project.elements.find(e => e.id === deckId && e.type === 'deck');
      if (!deck?.deckContent?.cards) return [];
      
      return deck.deckContent.cards.map(entry => {
        const card = state.project.elements.find(e => e.id === entry.cardId && e.type === 'card');
        return card ? { card, quantity: entry.quantity } : null;
      }).filter((item): item is { card: GameElement; quantity: number } => item !== null);
    },

    shuffleDeck: (deckId) => {
      const state = get();
      const deckCards = state.getDeckCards(deckId);
      
      // 展开所有卡牌实例
      const cardInstances: string[] = [];
      deckCards.forEach(({ card, quantity }) => {
        for (let i = 0; i < quantity; i++) {
          cardInstances.push(`${card.id}-${i}`); // 生成唯一实例ID
        }
      });
      
      // Fisher-Yates 洗牌算法
      for (let i = cardInstances.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardInstances[i], cardInstances[j]] = [cardInstances[j], cardInstances[i]];
      }
      
      return cardInstances;
    },

    drawCardsFromDeck: (deckId, count) => {
      const state = get();
      const shuffled = state.shuffleDeck(deckId);
      return shuffled.slice(0, count);
    },

    // Prop management actions
    updatePropUseCount: (propId, useCount) => set((state) => {
      const prop = state.project.elements.find(e => e.id === propId && e.type === 'prop');
      if (prop) {
        prop.useCount = Math.max(0, useCount);
      }
    }),

    resetPropUseCount: (propId) => set((state) => {
      const prop = state.project.elements.find(e => e.id === propId && e.type === 'prop');
      if (prop) {
        prop.useCount = prop.maxUseCount ?? 0;
      }
    }),

    // Card management actions
    duplicateCard: (cardId, quantity = 1) => set((state) => {
      const card = state.project.elements.find(e => e.id === cardId && e.type === 'card');
      if (!card) return;
      
      for (let i = 0; i < quantity; i++) {
        const newCard: GameElement = {
          ...deepClone(card),
          id: generateId(),
          name: `${card.name} (复制)`,
        };
        state.project.elements.push(newCard);
      }
    }),

    // Block actions
    addBlock: (block, target = 'global') => set((state) => {
      const newBlock = { ...block, id: generateId() };
      if (target === 'global' || !state.selectedElement) {
        state.project.globalScript.push(newBlock);
      } else {
        const element = state.project.elements.find(e => e.id === state.selectedElement);
        if (element) element.script.push(newBlock);
      }
    }),

    updateBlock: (blockId, updates) => set((state) => {
      let block = state.project.globalScript.find(b => b.id === blockId);
      if (!block && state.selectedElement) {
        const element = state.project.elements.find(e => e.id === state.selectedElement);
        if (element) block = element.script.find(b => b.id === blockId);
      }
      if (block) Object.assign(block, updates);
    }),

    addChildBlock: (parentId, block) => set((state) => {
      const newBlock = { ...block, id: generateId(), parent: parentId };
      
      // 查找父积木
      const findBlock = (blocks: Block[]): Block | null => {
        for (const b of blocks) {
          if (b.id === parentId) return b;
          if (b.children) {
            const found = findBlock(b.children);
            if (found) return found;
          }
        }
        return null;
      };
      
      const parent = findBlock(state.project.globalScript) ||
        state.project.elements.flatMap(el => findBlock(el.script) || [])[0];
      
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(newBlock);
      }
    }),

    deleteBlock: (blockId) => set((state) => {
      state.project.globalScript = state.project.globalScript.filter(b => b.id !== blockId);
      state.project.elements.forEach(el => {
        el.script = el.script.filter(b => b.id !== blockId);
      });
      if (state.selectedBlock === blockId) state.selectedBlock = null;
    }),

    setSelectedBlock: (id) => set({ selectedBlock: id }),
    setActiveScriptTab: (tab) => set({ activeScriptTab: tab }),
    
    moveBlock: (fromIndex, toIndex) => set((state) => {
      const script = state.activeScriptTab === 'global' || !state.selectedElement
        ? state.project.globalScript
        : state.project.elements.find(e => e.id === state.selectedElement)?.script;
      
      if (!script || fromIndex < 0 || toIndex < 0 || fromIndex >= script.length || toIndex > script.length) {
        return;
      }
      
      const [movedBlock] = script.splice(fromIndex, 1);
      script.splice(toIndex, 0, movedBlock);
    }),

    // Runtime actions - Integrated with execution engine
    startGame: async () => {
      const state = get();
      
      // Initialize runtime with current project
      const runtime = initRuntime();
      
      set((state) => {
        state.runtime.isPlaying = true;
        state.runtime.phase = 'playing';
        state.runtime.turnCount = 1;
        state.runtime.currentPlayerIndex = 0;
        state.runtime.currentPlayer = state.project.players[0]?.id || 'p1';
        state.runtime.logs.push({ type: 'info', message: '游戏开始', timestamp: Date.now() });
      });
      
      // Trigger game start event through runtime
      try {
        await runtime.startGame();
      } catch (error) {
        console.error('Error starting game:', error);
        set((state) => {
          state.execution.lastError = error instanceof Error ? error.message : '启动游戏失败';
          state.runtime.logs.push({ 
            type: 'error', 
            message: `启动游戏失败: ${error instanceof Error ? error.message : '未知错误'}`, 
            timestamp: Date.now() 
          });
        });
      }
    },

    pauseGame: () => set((state) => {
      state.runtime.isPaused = !state.runtime.isPaused;
      const runtime = getRuntime();
      if (runtime) {
        runtime.pauseGame();
      }
    }),

    resetGame: () => set((state) => {
      state.runtime = { ...defaultRuntime, gridState: state.runtime.gridState };
      state.execution = { ...defaultExecutionState };
      destroyRuntime();
    }),

    endTurn: async () => {
      const runtime = getRuntime();
      if (runtime) {
        await runtime.endTurn();
      }
      
      set((state) => {
        state.runtime.currentPlayerIndex = (state.runtime.currentPlayerIndex + 1) % state.project.players.length;
        if (state.runtime.currentPlayerIndex === 0) {
          state.runtime.turnCount++;
        }
        const player = state.project.players[state.runtime.currentPlayerIndex];
        state.runtime.currentPlayer = player?.id || 'p1';
        state.runtime.logs.push({ 
          type: 'info', 
          message: `切换到 ${player?.name || '玩家'} 的回合`, 
          timestamp: Date.now() 
        });
      });
    },

    moveElementToSlot: (elementId, slot) => set((state) => {
      // Remove from previous slot in gridState
      Object.keys(state.runtime.gridState).forEach(key => {
        if (state.runtime.gridState[parseInt(key)] === elementId) {
          delete state.runtime.gridState[parseInt(key)];
        }
      });
      
      // Remove from previous slot in gridSlots
      state.project.gridSlots.forEach(gridSlot => {
        if (gridSlot.elementId === elementId) {
          gridSlot.elementId = undefined;
        }
      });
      
      // Add to new slot in gridState
      if (slot !== null) {
        state.runtime.gridState[slot] = elementId;
        
        // Add to new slot in gridSlots
        const targetSlot = state.project.gridSlots.find(s => s.index === slot);
        if (targetSlot) {
          targetSlot.elementId = elementId;
        }
      }
      
      // Update element
      const element = state.project.elements.find(e => e.id === elementId);
      if (element) element.currentSlot = slot ?? undefined;
    }),

    setDraggingElement: (id) => set((state) => {
      state.runtime.draggingElement = id;
    }),

    addLog: (type, message) => set((state) => {
      state.runtime.logs.push({ type, message, timestamp: Date.now() });
    }),

    setExecutionSpeed: (speed) => set((state) => {
      state.runtime.speed = speed;
      const runtime = getRuntime();
      if (runtime) {
        runtime.setExecutionSpeed(speed);
      }
      // 添加日志
      state.runtime.logs.push({
        type: 'info',
        message: `执行速度已设置为: ${speed === 'slow' ? '慢速' : speed === 'fast' ? '快速' : '正常'}`,
        timestamp: Date.now()
      });
    }),

    // Execution actions
    triggerEvent: async (eventType, eventData = {}) => {
      const runtime = getRuntime();
      if (!runtime) {
        console.warn('Runtime not initialized');
        return;
      }
      
      const state = get();
      set((s) => { s.execution.isExecuting = true; });
      
      try {
        await runtime.triggerEvent(eventType, eventData);
      } catch (error) {
        console.error('Error triggering event:', error);
        set((s) => {
          s.execution.lastError = error instanceof Error ? error.message : '事件执行失败';
        });
      } finally {
        set((s) => { s.execution.isExecuting = false; });
      }
    },

    executeGlobalScript: async () => {
      const runtime = getRuntime();
      if (!runtime) return;
      
      const state = get();
      const interpreter = (runtime as any).interpreter;
      const eventSystem = (runtime as any).eventSystem;
      
      if (!interpreter || !eventSystem) return;
      
      set((s) => { s.execution.isExecuting = true; });
      
      try {
        const context = createExecutionContext(state.runtime.currentPlayer);
        await interpreter.executeEvent(
          state.project.globalScript,
          context,
          state.project.globalScript
        );
      } catch (error) {
        console.error('Error executing global script:', error);
        set((s) => {
          s.execution.lastError = error instanceof Error ? error.message : '脚本执行失败';
        });
      } finally {
        set((s) => { s.execution.isExecuting = false; });
      }
    },

    stepExecution: async () => {
      const runtime = getRuntime();
      if (!runtime) return;
      
      const state = get();
      const interpreter = (runtime as any).interpreter;
      const eventSystem = (runtime as any).eventSystem;
      
      if (!interpreter || !eventSystem) return;
      
      set((s) => { s.execution.isExecuting = true; });
      
      try {
        // 获取当前选中的积木
        const selectedBlockId = state.selectedBlock;
        let scriptToExecute: Block[] = [];
        let context = createExecutionContext(state.runtime.currentPlayer);
        
        if (selectedBlockId) {
          // 执行选中的积木
          const findBlock = (blocks: Block[]): Block | null => {
            for (const block of blocks) {
              if (block.id === selectedBlockId) return block;
              if (block.children) {
                const found = findBlock(block.children);
                if (found) return found;
              }
            }
            return null;
          };
          
          const block = findBlock(state.project.globalScript) ||
            state.project.elements.flatMap(el => findBlock(el.script) || [])[0];
          
          if (block) {
            // 高亮显示当前执行的积木
            set((s) => {
              s.execution.currentBlockId = block.id;
              s.execution.executingBlockIds.add(block.id);
            });
            
            // 执行单个积木
            await interpreter.executeBlock(block, context);
            
            // 清除高亮
            set((s) => {
              s.execution.currentBlockId = null;
              s.execution.executingBlockIds.delete(block.id);
            });
          }
        } else {
          // 如果没有选中积木，执行全局脚本的第一条
          if (state.project.globalScript.length > 0) {
            const firstBlock = state.project.globalScript[0];
            set((s) => {
              s.execution.currentBlockId = firstBlock.id;
              s.execution.executingBlockIds.add(firstBlock.id);
            });
            
            await interpreter.executeBlock(firstBlock, context);
            
            set((s) => {
              s.execution.currentBlockId = null;
              s.execution.executingBlockIds.delete(firstBlock.id);
            });
          }
        }
      } catch (error) {
        console.error('Error in step execution:', error);
        set((s) => {
          s.execution.lastError = error instanceof Error ? error.message : '单步执行失败';
        });
      } finally {
        set((s) => { s.execution.isExecuting = false; });
      }
    },

    executeElementScript: async (elementId) => {
      const runtime = getRuntime();
      if (!runtime) return;
      
      const state = get();
      const element = state.project.elements.find(e => e.id === elementId);
      if (!element || element.script.length === 0) return;
      
      const interpreter = (runtime as any).interpreter;
      if (!interpreter) return;
      
      set((s) => { s.execution.isExecuting = true; });
      
      try {
        const context = createExecutionContext(state.runtime.currentPlayer);
        await interpreter.executeEvent(
          element.script,
          context,
          element.script
        );
      } catch (error) {
        console.error('Error executing element script:', error);
        set((s) => {
          s.execution.lastError = error instanceof Error ? error.message : '脚本执行失败';
        });
      } finally {
        set((s) => { s.execution.isExecuting = false; });
      }
    },

    setExecutingBlock: (blockId) => set((state) => {
      state.execution.currentBlockId = blockId;
    }),

    addExecutingBlock: (blockId) => set((state) => {
      state.execution.executingBlockIds.add(blockId);
    }),

    removeExecutingBlock: (blockId) => set((state) => {
      state.execution.executingBlockIds.delete(blockId);
    }),

    clearExecutionState: () => set((state) => {
      state.execution = { ...defaultExecutionState };
    }),

    setExecutionError: (error) => set((state) => {
      state.execution.lastError = error;
    }),

    // Navigation
    setCurrentPage: (page) => set({ currentPage: page }),

    // Import/Export
    exportProject: (format) => {
      const state = get();
      const data = {
        ...state.project,
        exportDate: new Date().toISOString(),
      };
      
      if (format === 'json') {
        return JSON.stringify(data, null, 2);
      }
      
      // HTML format
      return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${data.name}</title>
  <style>
    body { font-family: system-ui; background: #fafafa; margin: 0; padding: 20px; }
    .board { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; max-width: 800px; margin: 0 auto; }
    .slot { aspect-ratio: 3/4; background: white; border: 2px solid #e5e5e5; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .card { width: 100%; height: 100%; background: #5686FE; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
  </style>
</head>
<body>
  <h1>${data.name}</h1>
  <div class="board" id="board"></div>
  <script>
    const project = ${JSON.stringify(data)};
    // Game logic here
    console.log('Loaded project:', project);
  </script>
</body>
</html>`;
    },

    importProject: (json) => set((state) => {
      try {
        const data = JSON.parse(json);
        state.project = data;
        state.runtime.logs.push({ type: 'info', message: '项目导入成功', timestamp: Date.now() });
      } catch (e) {
        state.runtime.logs.push({ type: 'error', message: '项目导入失败', timestamp: Date.now() });
      }
      
    }),

    // Runtime access
    getRuntime: () => getRuntime(),
  }))
);

// Export hook for components to access execution state
export function useExecutionState() {
  return useStore((state) => ({
    isExecuting: state.execution.isExecuting,
    currentBlockId: state.execution.currentBlockId,
    executingBlockIds: state.execution.executingBlockIds,
    lastError: state.execution.lastError,
    setExecutingBlock: state.setExecutingBlock,
    addExecutingBlock: state.addExecutingBlock,
    removeExecutingBlock: state.removeExecutingBlock,
    clearExecutionState: state.clearExecutionState,
    setExecutionError: state.setExecutionError,
  }));
}

// Auto-save hook
export function useAutoSave() {
  const saveProject = useStore((state) => state.saveProject);
  const project = useStore((state) => state.project);
  const runtime = useStore((state) => state.runtime);
  
  // 使用useEffect来监听项目变化并自动保存
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // 只有在编辑器页面且项目有变化时才自动保存
      const currentPage = useStore.getState().currentPage;
      if (currentPage === 'editor' && project.name !== '未命名桌游') {
        saveProject();
      }
    }, 5000); // 5秒后自动保存
    
    return () => clearTimeout(timer);
  }, [project, runtime, saveProject]);
}

// Initialize store with auto-save
if (typeof window !== 'undefined') {
  // 加载最近保存的项目
  try {
    const savedCurrent = localStorage.getItem('cardengine_current_project');
    if (savedCurrent) {
      const projectData = JSON.parse(savedCurrent);
      useStore.getState().setProject(projectData.project);
      console.log('已加载最近项目:', projectData.name);
    }
  } catch (error) {
    console.error('加载最近项目失败:', error);
  }
}
