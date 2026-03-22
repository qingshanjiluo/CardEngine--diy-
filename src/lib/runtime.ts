// src/lib/runtime.ts
// 游戏运行时系统 - 实现 GameRuntime 接口

import { GameElement, Player, Project, RuntimeState, Block } from '@/types';
import { 
  GameRuntime, 
  BlockInterpreter, 
  EventSystem, 
  createInterpreter, 
  createEventSystem,
  createExecutionContext 
} from './interpreter';
import { useStore } from './store';
import { generateId, deepClone } from './utils';

// ============ 游戏运行时实现 ============

export class GameRuntimeImpl implements GameRuntime {
  private store: ReturnType<typeof useStore.getState>;
  private interpreter: BlockInterpreter;
  private eventSystem: EventSystem;
  private highlightedBlockId: string | null = null;
  private executionSpeed: number = 1;
  private isExecuting = false;

  constructor(store: ReturnType<typeof useStore.getState>) {
    this.store = store;
    this.interpreter = createInterpreter(this);
    this.eventSystem = createEventSystem(this.interpreter, this);
    this.loadEvents();
  }

  // 加载事件监听
  private loadEvents() {
    this.eventSystem.loadFromProject(this.store.project);
  }

  // 重新加载事件（当项目改变时）
  reloadEvents() {
    this.loadEvents();
  }

  // ============ 状态访问 ============

  getState(): RuntimeState {
    return this.store.runtime;
  }

  getProject(): Project {
    return this.store.project;
  }

  // ============ 元素操作 ============

  getElement(id: string): GameElement | undefined {
    return this.store.project.elements.find(e => e.id === id);
  }

  getElementAtSlot(slot: number): GameElement | undefined {
    const elementId = this.store.runtime.gridState[slot];
    if (!elementId) return undefined;
    return this.getElement(elementId);
  }

  moveElement(elementId: string, slot: number | null): void {
    this.store.moveElementToSlot(elementId, slot);
  }

  createElement(templateId: string, slot: number): GameElement | null {
    const template = this.getElement(templateId);
    if (!template) {
      this.addLog('error', `模板元素不存在: ${templateId}`);
      return null;
    }

    // 创建新元素（深拷贝模板）
    const newElement: GameElement = {
      ...deepClone(template),
      id: generateId(),
      name: `${template.name}_${Date.now()}`,
      currentSlot: slot,
      owner: undefined,
    };

    // 添加到项目
    this.store.addElement(newElement);
    
    // 移动到指定位置
    if (slot !== null) {
      this.moveElement(newElement.id, slot);
    }

    this.addLog('info', `创建元素: ${newElement.name}`);
    return newElement;
  }

  deleteElement(elementId: string): void {
    // 从格子中移除
    this.moveElement(elementId, null);
    
    // 从项目中删除
    this.store.deleteElement(elementId);
    
    // 从所有玩家的手牌中移除
    for (const player of this.store.project.players) {
      const index = player.handCards.indexOf(elementId);
      if (index > -1) {
        player.handCards.splice(index, 1);
      }
    }
  }

  setElementProperty(elementId: string, property: string, value: any): void {
    const element = this.getElement(elementId);
    if (!element) return;

    if (property === 'visible') {
      this.store.updateElement(elementId, { visible: value });
    } else if (property === 'face') {
      this.store.updateElement(elementId, { face: value });
    } else if (element.properties[property]) {
      const newProperties = { ...element.properties };
      newProperties[property] = { ...newProperties[property], value };
      this.store.updateElement(elementId, { properties: newProperties });
    } else {
      // 动态属性
      const newProperties = { ...element.properties };
      newProperties[property] = { type: 'string', value, label: property };
      this.store.updateElement(elementId, { properties: newProperties });
    }
  }

  getElementProperty(elementId: string, property: string): any {
    const element = this.getElement(elementId);
    if (!element) return null;

    if (property === 'visible') {
      return element.visible;
    } else if (property === 'face') {
      return element.face;
    } else if (element.properties[property]) {
      return element.properties[property].value;
    }
    return null;
  }

  // ============ 卡牌操作 ============

  drawCards(count: number, deckId: string, playerId: string): string[] {
    const deck = this.getElement(deckId);
    if (!deck || deck.type !== 'deck') {
      this.addLog('error', `牌堆不存在: ${deckId}`);
      return [];
    }

    // 获取牌堆中的卡牌（从 deckContent）
    const deckContent = deck.deckContent;
    if (!deckContent || deckContent.cards.length === 0) {
      this.addLog('info', `牌堆为空: ${deck.name}`);
      this.triggerEvent(`deck:empty:${deckId}`, { deckId });
      return [];
    }

    const drawnCards: string[] = [];
    const newCards = [...deckContent.cards];

    for (let i = 0; i < count && newCards.length > 0; i++) {
      // 从牌堆顶部抽牌（数组第一个）
      const entry = newCards[0];
      if (entry) {
        drawnCards.push(entry.cardId);
        
        // 减少数量或移除
        if (entry.quantity > 1) {
          newCards[0] = { ...entry, quantity: entry.quantity - 1 };
        } else {
          newCards.shift();
        }
        
        // 创建卡牌实例到游戏中
        const cardTemplate = this.getElement(entry.cardId);
        if (cardTemplate) {
          const newCard: GameElement = {
            ...deepClone(cardTemplate),
            id: generateId(),
            owner: playerId,
          };
          this.store.addElement(newCard);
          drawnCards[drawnCards.length - 1] = newCard.id;
        }
      }
    }

    // 更新牌堆内容
    this.store.updateElement(deckId, {
      deckContent: { cards: newCards }
    });

    // 添加到玩家手牌
    const player = this.store.project.players.find(p => p.id === playerId);
    if (player) {
      player.handCards.push(...drawnCards);
    }

    // 触发牌堆抽空事件
    if (newCards.length === 0) {
      this.triggerEvent(`deck:empty:${deckId}`, { deckId });
    }

    this.addLog('info', `从 ${deck.name} 抽取了 ${drawnCards.length} 张牌`);
    this.playSound('draw');
    return drawnCards;
  }

  shuffleDeck(deckId: string): void {
    const deck = this.getElement(deckId);
    if (!deck || deck.type !== 'deck') return;

    const deckContent = deck.deckContent;
    if (!deckContent || deckContent.cards.length === 0) return;

    // 展开卡牌列表（根据数量）
    const expandedCards: string[] = [];
    for (const entry of deckContent.cards) {
      for (let i = 0; i < entry.quantity; i++) {
        expandedCards.push(entry.cardId);
      }
    }

    // Fisher-Yates 洗牌算法
    for (let i = expandedCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [expandedCards[i], expandedCards[j]] = [expandedCards[j], expandedCards[i]];
    }

    // 重新压缩为 entries（合并相同卡牌）
    const cardCount = new Map<string, number>();
    for (const cardId of expandedCards) {
      cardCount.set(cardId, (cardCount.get(cardId) || 0) + 1);
    }

    const newCards = Array.from(cardCount.entries()).map(([cardId, quantity]) => ({
      cardId,
      quantity
    }));

    // 更新牌堆内容
    this.store.updateElement(deckId, {
      deckContent: { cards: newCards }
    });

    this.addLog('info', `洗牌完成: ${deck.name} (${expandedCards.length} 张)`);
  }

  flipCard(cardId: string): void {
    const card = this.getElement(cardId);
    if (!card || card.type !== 'card') return;

    // 如果有定义的面，则循环切换
    if (card.faces && Object.keys(card.faces).length > 0) {
      const faceKeys = Object.keys(card.faces);
      const currentIndex = faceKeys.indexOf(card.face);
      const nextIndex = (currentIndex + 1) % faceKeys.length;
      const newFace = faceKeys[nextIndex];
      this.store.updateElement(cardId, { face: newFace });
    } else {
      // 默认的正反面切换
      const newFace = card.face === 'front' ? 'back' : 'front';
      this.store.updateElement(cardId, { face: newFace });
    }
  }

  // 切换到指定面
  setCardFace(cardId: string, face: string): void {
    const card = this.getElement(cardId);
    if (!card || card.type !== 'card') return;
    
    // 检查面是否存在
    if (card.faces && !card.faces[face]) {
      console.warn(`卡牌 ${cardId} 没有面 "${face}"`);
      return;
    }
    
    this.store.updateElement(cardId, { face });
  }

  getDeckCards(deckId: string): string[] {
    const deck = this.getElement(deckId);
    if (!deck || deck.type !== 'deck') return [];

    const deckContent = deck.deckContent;
    if (!deckContent) return [];

    // 展开卡牌列表（根据数量）
    const cards: string[] = [];
    for (const entry of deckContent.cards) {
      for (let i = 0; i < entry.quantity; i++) {
        cards.push(entry.cardId);
      }
    }

    return cards;
  }

  getCardCount(deckId: string): number {
    const deck = this.getElement(deckId);
    if (!deck || deck.type !== 'deck' || !deck.deckContent) return 0;
    
    return deck.deckContent.cards.reduce((sum, entry) => sum + entry.quantity, 0);
  }

  // ============ 玩家操作 ============

  getPlayer(id: string): Player | undefined {
    return this.store.project.players.find(p => p.id === id);
  }

  setPlayerProperty(playerId: string, property: string, value: any): void {
    const player = this.getPlayer(playerId);
    if (!player) return;

    if (player.properties[property]) {
      const newProperties = { ...player.properties };
      newProperties[property] = { ...newProperties[property], value };
      
      // 更新玩家属性
      const playerIndex = this.store.project.players.findIndex(p => p.id === playerId);
      if (playerIndex > -1) {
        const newPlayers = [...this.store.project.players];
        newPlayers[playerIndex] = { ...player, properties: newProperties };
        // 使用 updateProjectSettings 或直接修改
        this.store.project.players[playerIndex].properties = newProperties;
      }
    }

    // 同时更新 runtime 中的 stats
    if (this.store.runtime.players[playerId]) {
      this.store.runtime.players[playerId].stats[property] = value;
    }
  }

  getPlayerProperty(playerId: string, property: string): any {
    const player = this.getPlayer(playerId);
    if (!player) return null;

    if (player.properties[property]) {
      return player.properties[property].value;
    }

    // 从 stats 中查找
    const stat = player.stats.find(s => s.key === property);
    if (stat) {
      return this.store.runtime.players[playerId]?.stats[property] ?? stat.defaultValue;
    }

    return null;
  }

  setPlayerVariable(playerId: string, name: string, value: any): void {
    const player = this.getPlayer(playerId);
    if (!player) return;

    player.variables[name] = value;
  }

  getPlayerVariable(playerId: string, name: string): any {
    const player = this.getPlayer(playerId);
    if (!player) return null;

    return player.variables[name];
  }

  setCurrentPlayer(playerId: string): void {
    const playerIndex = this.store.project.players.findIndex(p => p.id === playerId);
    if (playerIndex > -1) {
      this.store.project.players.forEach((p, i) => {
        p.isActive = i === playerIndex;
      });
      
      // 更新 runtime
      this.store.runtime.currentPlayerIndex = playerIndex;
      this.store.runtime.currentPlayer = playerId;
    }
  }

  getCurrentPlayer(): Player {
    return this.store.project.players[this.store.runtime.currentPlayerIndex] ||
           this.store.project.players[0];
  }

  // ============ 道具操作 ============

  useProp(propId: string, playerId: string): boolean {
    const prop = this.getElement(propId);
    if (!prop || prop.type !== 'prop') {
      this.addLog('error', `道具不存在: ${propId}`);
      return false;
    }

    const currentUseCount = prop.useCount ?? 0;
    const maxUseCount = prop.maxUseCount ?? Infinity;

    // 检查是否还有使用次数
    if (currentUseCount <= 0 && maxUseCount !== Infinity) {
      this.addLog('info', `道具 ${prop.name} 使用次数已耗尽`);
      return false;
    }

    // 减少使用次数
    const newUseCount = Math.max(0, currentUseCount - 1);
    this.store.updatePropUseCount(propId, newUseCount);

    // 触发道具使用事件
    this.triggerEvent(`prop:use:${propId}`, {
      propId,
      playerId,
      effect: prop.propEffect
    });

    this.addLog('info', `玩家使用了道具: ${prop.name}`);
    this.playSound('use');
    return true;
  }

  getPropUseCount(propId: string): number {
    const prop = this.getElement(propId);
    if (!prop || prop.type !== 'prop') return 0;
    return prop.useCount ?? 0;
  }

  setPropUseCount(propId: string, count: number): void {
    this.store.updatePropUseCount(propId, count);
  }

  // ============ 回合管理 ============

  endTurn(): void {
    this.store.endTurn();
    
    // 触发回合开始事件
    const nextPlayer = this.getCurrentPlayer();
    this.triggerEvent('turn:start', { playerId: nextPlayer.id });
    this.triggerEvent(`turn:start:${nextPlayer.id}`, { playerId: nextPlayer.id });
  }

  resetGame(): void {
    this.store.resetGame();
    
    // 重置所有玩家属性
    for (const player of this.store.project.players) {
      for (const stat of player.stats) {
        this.setPlayerProperty(player.id, stat.key, stat.defaultValue);
      }
      player.handCards = [];
      player.variables = {};
    }

    // 触发游戏开始事件
    this.triggerEvent('game:start', {});
  }

  // ============ 事件触发 ============

  async triggerEvent(eventType: string, eventData?: any): Promise<void> {
    const currentPlayer = this.getCurrentPlayer()?.id;
    await this.eventSystem.triggerEvent(eventType, eventData, currentPlayer);
  }

  // ============ UI 反馈 ============

  highlightBlock(blockId: string): void {
    this.highlightedBlockId = blockId;
    // 更新 store 中的选中状态
    this.store.setSelectedBlock(blockId);
  }

  clearHighlight(): void {
    this.highlightedBlockId = null;
    this.store.setSelectedBlock(null);
  }

  playSound(sound: string): void {
    // 实际音效播放逻辑
    const audio = new Audio(`/sounds/${sound}.mp3`);
    audio.play().catch(() => {
      // 音效播放失败，静默处理
    });
  }

  addLog(type: 'info' | 'error' | 'broadcast', message: string): void {
    this.store.addLog(type, message);
  }

  // ============ 等待机制 ============

  async wait(seconds: number): Promise<void> {
    const delay = seconds * 1000 / this.executionSpeed;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async waitUntil(condition: () => boolean | Promise<boolean>, timeout = 30000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const result = await condition();
      if (result) return true;
      await this.wait(0.1); // 每100ms检查一次
    }
    
    return false; // 超时
  }

  // ============ 游戏控制 ============

  async startGame(): Promise<void> {
    if (this.isExecuting) return;
    
    this.store.startGame();
    this.isExecuting = true;

    // 触发游戏开始事件
    await this.triggerEvent('game:start', {});

    // 触发第一个玩家的回合开始事件
    const firstPlayer = this.getCurrentPlayer();
    await this.triggerEvent('turn:start', { playerId: firstPlayer.id });
    await this.triggerEvent(`turn:start:${firstPlayer.id}`, { playerId: firstPlayer.id });
  }

  pauseGame(): void {
    this.store.pauseGame();
  }

  stopGame(): void {
    this.interpreter.stopExecution();
    this.isExecuting = false;
    this.store.resetGame();
  }

  setExecutionSpeed(speed: 'slow' | 'normal' | 'fast'): void {
    const speedMap = { slow: 0.5, normal: 1, fast: 2 };
    this.executionSpeed = speedMap[speed];
  }

  // 处理元素点击
  async handleElementClick(elementId: string): Promise<void> {
    await this.triggerEvent(`element:click:${elementId}`, { elementId });
    await this.triggerEvent('element:click', { elementId });
  }

  // 检查是否正在执行
  isRunning(): boolean {
    return this.isExecuting;
  }
}

// ============ 单例管理 ============

let runtimeInstance: GameRuntimeImpl | null = null;

export function getRuntime(): GameRuntimeImpl | null {
  return runtimeInstance;
}

export function initRuntime(): GameRuntimeImpl {
  const store = useStore.getState();
  runtimeInstance = new GameRuntimeImpl(store);
  return runtimeInstance;
}

export function resetRuntime(): void {
  runtimeInstance = null;
}

export function destroyRuntime(): void {
  runtimeInstance = null;
}

// ============ 导出类型 ============
export type { GameRuntime };
