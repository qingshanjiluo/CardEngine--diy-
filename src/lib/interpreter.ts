// src/lib/interpreter.ts
// 积木执行引擎 - 解析和执行积木逻辑

import { Block, BlockCategory, GameElement, Player, Project, RuntimeState } from '@/types';
import { BLOCK_DEFINITIONS } from './block-definitions';

// ============ 类型定义 ============

export type ExecutionStatus = 'running' | 'paused' | 'stopped' | 'error';
export type ExecutionMode = 'sync' | 'async';

export interface ExecutionContext {
  variables: Map<string, any>;
  lists: Map<string, any[]>;
  playerVariables: Map<string, Map<string, any>>; // playerId -> variables
  currentPlayer: string;
  eventData?: any;
  callStack: string[];
  returnValue?: any;
  breakLoop: boolean;
}

export interface ExecutionResult {
  success: boolean;
  value?: any;
  error?: string;
}

export type BlockHandler = (
  block: Block,
  context: ExecutionContext,
  runtime: GameRuntime
) => Promise<ExecutionResult> | ExecutionResult;

// ============ 执行上下文管理 ============

export function createExecutionContext(currentPlayer: string, eventData?: any): ExecutionContext {
  return {
    variables: new Map(),
    lists: new Map(),
    playerVariables: new Map(),
    currentPlayer,
    eventData,
    callStack: [],
    breakLoop: false,
  };
}

export function cloneExecutionContext(context: ExecutionContext): ExecutionContext {
  return {
    variables: new Map(context.variables),
    lists: new Map(context.lists),
    playerVariables: new Map(
      Array.from(context.playerVariables.entries()).map(([k, v]) => [k, new Map(v)])
    ),
    currentPlayer: context.currentPlayer,
    eventData: context.eventData,
    callStack: [...context.callStack],
    breakLoop: context.breakLoop,
  };
}

// ============ 游戏运行时接口 ============

export interface GameRuntime {
  // 状态访问
  getState(): RuntimeState;
  getProject(): Project;
  
  // 元素操作
  getElement(id: string): GameElement | undefined;
  getElementAtSlot(slot: number): GameElement | undefined;
  moveElement(elementId: string, slot: number | null): void;
  createElement(templateId: string, slot: number): GameElement | null;
  deleteElement(elementId: string): void;
  setElementProperty(elementId: string, property: string, value: any): void;
  getElementProperty(elementId: string, property: string): any;
  
  // 卡牌操作
  drawCards(count: number, deckId: string, playerId: string): string[];
  shuffleDeck(deckId: string): void;
  flipCard(cardId: string): void;
  setCardFace(cardId: string, face: string): void;
  getDeckCards(deckId: string): string[];
  getCardCount(deckId: string): number;
  
  // 道具操作
  useProp(propId: string, playerId: string): boolean;
  getPropUseCount(propId: string): number;
  setPropUseCount(propId: string, count: number): void;
  
  // 玩家操作
  getPlayer(id: string): Player | undefined;
  setPlayerProperty(playerId: string, property: string, value: any): void;
  getPlayerProperty(playerId: string, property: string): any;
  setPlayerVariable(playerId: string, name: string, value: any): void;
  getPlayerVariable(playerId: string, name: string): any;
  setCurrentPlayer(playerId: string): void;
  getCurrentPlayer(): Player;
  
  // 回合管理
  endTurn(): void;
  resetGame(): void;
  
  // UI 反馈
  highlightBlock(blockId: string): void;
  clearHighlight(): void;
  playSound(sound: string): void;
  addLog(type: 'info' | 'error' | 'broadcast', message: string): void;
  
  // 等待机制
  wait(seconds: number): Promise<void>;
  waitUntil(condition: () => boolean | Promise<boolean>, timeout?: number): Promise<boolean>;
}

// ============ 积木执行器 ============

export class BlockInterpreter {
  private handlers: Map<string, BlockHandler> = new Map();
  private runtime: GameRuntime;
  private isExecuting = false;
  private shouldStop = false;
  private currentBlockId: string | null = null;

  constructor(runtime: GameRuntime) {
    this.runtime = runtime;
    this.registerDefaultHandlers();
  }

  // 注册积木处理器
  registerHandler(blockType: string, handler: BlockHandler) {
    this.handlers.set(blockType, handler);
  }

  // 执行单个积木
  async executeBlock(block: Block, context: ExecutionContext): Promise<ExecutionResult> {
    if (this.shouldStop) {
      return { success: false, error: 'Execution stopped' };
    }

    // 高亮当前执行的积木
    this.currentBlockId = block.id;
    this.runtime.highlightBlock(block.id);

    const handler = this.handlers.get(block.type);
    if (!handler) {
      return { success: false, error: `Unknown block type: ${block.type}` };
    }

    try {
      const result = await handler(block, context, this.runtime);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.runtime.addLog('error', `执行积木失败: ${block.type} - ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }

  // 执行积木链
  async executeBlockChain(
    startBlock: Block,
    blocks: Block[],
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    let currentBlock: Block | undefined = startBlock;
    let lastResult: ExecutionResult = { success: true };

    while (currentBlock && !this.shouldStop && !context.breakLoop) {
      lastResult = await this.executeBlock(currentBlock, context);
      
      if (!lastResult.success) {
        return lastResult;
      }

      // 如果有返回值且是 return 积木，结束执行
      if (lastResult.value !== undefined && currentBlock.type.startsWith('control_return')) {
        context.returnValue = lastResult.value;
        break;
      }

      // 继续执行下一个积木
      if (currentBlock.next) {
        currentBlock = blocks.find(b => b.id === currentBlock!.next);
      } else {
        currentBlock = undefined;
      }
    }

    return lastResult;
  }

  // 执行事件处理脚本
  async executeEvent(
    eventBlocks: Block[],
    context: ExecutionContext,
    allBlocks: Block[]
  ): Promise<ExecutionResult> {
    this.isExecuting = true;
    this.shouldStop = false;

    try {
      for (const block of eventBlocks) {
        if (this.shouldStop) break;
        
        const result = await this.executeBlockChain(block, allBlocks, context);
        if (!result.success) {
          return result;
        }
      }
      return { success: true };
    } finally {
      this.isExecuting = false;
      this.currentBlockId = null;
      this.runtime.clearHighlight();
    }
  }

  // 停止执行
  stopExecution() {
    this.shouldStop = true;
  }

  // 获取当前执行的积木ID
  getCurrentBlockId(): string | null {
    return this.currentBlockId;
  }

  // 检查是否正在执行
  isRunning(): boolean {
    return this.isExecuting;
  }

  // ============ 注册默认处理器 ============

  private registerDefaultHandlers() {
    // ===== 事件类积木 =====
    // 事件积木是入口点，不需要处理器

    // ===== 控制类积木 =====
    this.registerControlHandlers();
    
    // ===== 动作类积木 =====
    this.registerActionHandlers();
    
    // ===== 侦测类积木 =====
    this.registerSensingHandlers();
    
    // ===== 数据类积木 =====
    this.registerDataHandlers();
    
    // ===== 运算类积木 =====
    this.registerOperatorHandlers();
    
    // ===== 数学运算积木 =====
    this.registerMathHandlers();
    
    // ===== 文本运算积木 =====
    this.registerTextHandlers();
    
    // ===== 自定义积木 =====
    this.registerCustomHandlers();
  }

  // ===== 控制类处理器 =====
  private registerControlHandlers() {
    // 重复执行（无限循环）
    this.registerHandler('control_forever', async (block, context, runtime) => {
      const childBlocks = this.getChildBlocks(block);
      
      while (!this.shouldStop && !context.breakLoop) {
        for (const childBlock of childBlocks) {
          const result = await this.executeBlockChain(childBlock, childBlocks, context);
          if (!result.success) return result;
          if (context.breakLoop) {
            context.breakLoop = false;
            return { success: true };
          }
        }
      }
      return { success: true };
    });

    // 重复执行直到
    this.registerHandler('control_repeat_until', async (block, context, runtime) => {
      const conditionBlock = block.inputs.condition?.value as Block | undefined;
      const childBlocks = this.getChildBlocks(block);
      
      while (!this.shouldStop) {
        // 检查条件
        if (conditionBlock) {
          const conditionResult = await this.executeBlock(conditionBlock, context);
          if (!conditionResult.success) return conditionResult;
          if (conditionResult.value) break;
        }
        
        // 执行子积木
        for (const childBlock of childBlocks) {
          const result = await this.executeBlockChain(childBlock, childBlocks, context);
          if (!result.success) return result;
          if (context.breakLoop) {
            context.breakLoop = false;
            return { success: true };
          }
        }
      }
      return { success: true };
    });

    // 如果...那么
    this.registerHandler('control_if', async (block, context, runtime) => {
      const conditionBlock = block.inputs.condition?.value as Block | undefined;
      const childBlocks = this.getChildBlocks(block);
      
      let shouldExecute = true;
      if (conditionBlock) {
        const conditionResult = await this.executeBlock(conditionBlock, context);
        if (!conditionResult.success) return conditionResult;
        shouldExecute = !!conditionResult.value;
      }
      
      if (shouldExecute) {
        for (const childBlock of childBlocks) {
          const result = await this.executeBlockChain(childBlock, childBlocks, context);
          if (!result.success) return result;
        }
      }
      return { success: true };
    });

    // 如果...那么...否则
    this.registerHandler('control_if_else', async (block, context, runtime) => {
      const conditionBlock = block.inputs.condition?.value as Block | undefined;
      const childBlocks = this.getChildBlocks(block);
      // 简化实现：假设前一半是 if 分支，后一半是 else 分支
      const midPoint = Math.floor(childBlocks.length / 2);
      const ifBlocks = childBlocks.slice(0, midPoint);
      const elseBlocks = childBlocks.slice(midPoint);
      
      let shouldExecuteIf = true;
      if (conditionBlock) {
        const conditionResult = await this.executeBlock(conditionBlock, context);
        if (!conditionResult.success) return conditionResult;
        shouldExecuteIf = !!conditionResult.value;
      }
      
      const blocksToExecute = shouldExecuteIf ? ifBlocks : elseBlocks;
      for (const childBlock of blocksToExecute) {
        const result = await this.executeBlockChain(childBlock, blocksToExecute, context);
        if (!result.success) return result;
      }
      return { success: true };
    });

    // 退出循环
    this.registerHandler('control_break_if', async (block, context, runtime) => {
      const conditionBlock = block.inputs.condition?.value as Block | undefined;
      
      if (conditionBlock) {
        const conditionResult = await this.executeBlock(conditionBlock, context);
        if (!conditionResult.success) return conditionResult;
        if (conditionResult.value) {
          context.breakLoop = true;
        }
      }
      return { success: true };
    });

    // 返回
    this.registerHandler('control_return_if', async (block, context, runtime) => {
      const conditionBlock = block.inputs.condition?.value as Block | undefined;
      const value = block.inputs.value?.value;
      
      let shouldReturn = true;
      if (conditionBlock) {
        const conditionResult = await this.executeBlock(conditionBlock, context);
        if (!conditionResult.success) return conditionResult;
        shouldReturn = !!conditionResult.value;
      }
      
      if (shouldReturn) {
        return { success: true, value };
      }
      return { success: true };
    });

    // 广播
    this.registerHandler('control_broadcast', async (block, context, runtime) => {
      const message = String(block.inputs.message?.value || '');
      const param = block.inputs.param?.value;
      
      // 触发广播事件
      runtime.addLog('broadcast', `广播: ${message}`);
      // 这里应该触发事件系统中的广播处理
      
      return { success: true };
    });

    // 广播并等待
    this.registerHandler('control_broadcast_wait', async (block, context, runtime) => {
      const message = String(block.inputs.message?.value || '');
      const param = block.inputs.param?.value;
      
      runtime.addLog('broadcast', `广播并等待: ${message}`);
      // 这里应该触发事件系统中的广播处理并等待完成
      
      return { success: true };
    });

    // 等待
    this.registerHandler('control_wait', async (block, context, runtime) => {
      const seconds = Number(block.inputs.seconds?.value) || 0;
      await runtime.wait(seconds);
      return { success: true };
    });

    // 等待直到
    this.registerHandler('control_wait_until', async (block, context, runtime) => {
      const conditionBlock = block.inputs.condition?.value as Block | undefined;
      
      if (conditionBlock) {
        await runtime.waitUntil(async () => {
          const result = await this.executeBlock(conditionBlock, cloneExecutionContext(context));
          return result.success && !!result.value;
        }, 30000); // 30秒超时
      }
      return { success: true };
    });
  }

  // ===== 动作类处理器 =====
  private registerActionHandlers() {
    // 移动元素
    this.registerHandler('action_move', async (block, context, runtime) => {
      const elementId = String(block.inputs.element?.value || '');
      const slot = Number(block.inputs.slot?.value);
      
      if (elementId) {
        runtime.moveElement(elementId, slot);
        runtime.addLog('info', `移动 ${elementId} 到格子 ${slot}`);
      }
      return { success: true };
    });

    // 创建元素
    this.registerHandler('action_create', async (block, context, runtime) => {
      const templateId = String(block.inputs.template?.value || '');
      const slot = Number(block.inputs.slot?.value);
      
      if (templateId) {
        const element = runtime.createElement(templateId, slot);
        if (element) {
          runtime.addLog('info', `创建 ${element.name} 在格子 ${slot}`);
        }
      }
      return { success: true };
    });

    // 删除元素
    this.registerHandler('action_delete', async (block, context, runtime) => {
      const elementId = String(block.inputs.element?.value || '');
      
      if (elementId) {
        runtime.deleteElement(elementId);
        runtime.addLog('info', `删除元素 ${elementId}`);
      }
      return { success: true };
    });

    // 修改属性
    this.registerHandler('action_set_property', async (block, context, runtime) => {
      const elementId = String(block.inputs.element?.value || '');
      const property = String(block.inputs.property?.value || '');
      const value = block.inputs.value?.value;
      
      if (elementId && property) {
        runtime.setElementProperty(elementId, property, value);
      }
      return { success: true };
    });

    // 抽取卡牌
    this.registerHandler('action_draw_cards', async (block, context, runtime) => {
      const count = Number(block.inputs.count?.value) || 1;
      const deckId = String(block.inputs.deck?.value || '');
      const target = String(block.inputs.target?.value || 'current');
      const playerId = target === 'current' ? context.currentPlayer : target;
      
      if (deckId) {
        const cardIds = runtime.drawCards(count, deckId, playerId);
        runtime.addLog('info', `从牌堆抽取 ${cardIds.length} 张牌`);
      }
      return { success: true };
    });

    // 洗牌
    this.registerHandler('action_shuffle', async (block, context, runtime) => {
      const deckId = String(block.inputs.deck?.value || '');
      
      if (deckId) {
        runtime.shuffleDeck(deckId);
        runtime.addLog('info', '洗牌完成');
        runtime.playSound('shuffle');
      }
      return { success: true };
    });

    // 翻转卡牌
    this.registerHandler('action_flip', async (block, context, runtime) => {
      const cardId = String(block.inputs.card?.value || '');
      
      if (cardId) {
        runtime.flipCard(cardId);
        runtime.addLog('info', `翻转卡牌 ${cardId}`);
      }
      return { success: true };
    });

    // 显示元素
    this.registerHandler('action_show', async (block, context, runtime) => {
      const elementId = String(block.inputs.element?.value || '');
      
      if (elementId) {
        runtime.setElementProperty(elementId, 'visible', true);
      }
      return { success: true };
    });

    // 隐藏元素
    this.registerHandler('action_hide', async (block, context, runtime) => {
      const elementId = String(block.inputs.element?.value || '');
      
      if (elementId) {
        runtime.setElementProperty(elementId, 'visible', false);
      }
      return { success: true };
    });

    // 设置玩家属性
    this.registerHandler('action_set_player_property', async (block, context, runtime) => {
      const player = String(block.inputs.player?.value || 'current');
      const property = String(block.inputs.property?.value || '');
      const value = Number(block.inputs.value?.value) || 0;
      
      const playerId = player === 'current' ? context.currentPlayer : player;
      runtime.setPlayerProperty(playerId, property, value);
      return { success: true };
    });

    // 增加玩家属性
    this.registerHandler('action_add_player_property', async (block, context, runtime) => {
      const player = String(block.inputs.player?.value || 'current');
      const property = String(block.inputs.property?.value || '');
      const value = Number(block.inputs.value?.value) || 0;
      
      const playerId = player === 'current' ? context.currentPlayer : player;
      const currentValue = runtime.getPlayerProperty(playerId, property) || 0;
      runtime.setPlayerProperty(playerId, property, currentValue + value);
      return { success: true };
    });

    // 播放音效
    this.registerHandler('action_play_sound', async (block, context, runtime) => {
      const sound = String(block.inputs.sound?.value || 'click');
      runtime.playSound(sound);
      return { success: true };
    });

    // 设置当前玩家
    this.registerHandler('action_set_current_player', async (block, context, runtime) => {
      const player = String(block.inputs.player?.value || 'current');
      const playerId = player === 'current' ? context.currentPlayer : player;
      runtime.setCurrentPlayer(playerId);
      context.currentPlayer = playerId;
      return { success: true };
    });

    // 结束回合
    this.registerHandler('action_end_turn', async (block, context, runtime) => {
      runtime.endTurn();
      return { success: true };
    });

    // 重置游戏
    this.registerHandler('action_reset_game', async (block, context, runtime) => {
      runtime.resetGame();
      return { success: true };
    });
  }

  // ===== 侦测类处理器 =====
  private registerSensingHandlers() {
    // 获取格子上的元素
    this.registerHandler('sensing_at_slot', async (block, context, runtime) => {
      const slot = Number(block.inputs.slot?.value) || 0;
      const element = runtime.getElementAtSlot(slot);
      return { success: true, value: element?.id || null };
    });

    // 格子是否被占据
    this.registerHandler('sensing_slot_occupied', async (block, context, runtime) => {
      const slot = Number(block.inputs.slot?.value) || 0;
      const element = runtime.getElementAtSlot(slot);
      return { success: true, value: !!element };
    });

    // 获取元素属性
    this.registerHandler('sensing_get_property', async (block, context, runtime) => {
      const elementId = String(block.inputs.element?.value || '');
      const property = String(block.inputs.property?.value || '');
      
      if (elementId && property) {
        const value = runtime.getElementProperty(elementId, property);
        return { success: true, value };
      }
      return { success: true, value: null };
    });

    // 获取玩家属性
    this.registerHandler('sensing_get_player_property', async (block, context, runtime) => {
      const player = String(block.inputs.player?.value || 'current');
      const property = String(block.inputs.property?.value || '');
      
      const playerId = player === 'current' ? context.currentPlayer : player;
      const value = runtime.getPlayerProperty(playerId, property);
      return { success: true, value };
    });

    // 手牌数量
    this.registerHandler('sensing_hand_count', async (block, context, runtime) => {
      const player = String(block.inputs.player?.value || 'current');
      const playerId = player === 'current' ? context.currentPlayer : player;
      const playerData = runtime.getPlayer(playerId);
      return { success: true, value: playerData?.handCards.length || 0 };
    });

    // 牌堆数量
    this.registerHandler('sensing_deck_count', async (block, context, runtime) => {
      const deckId = String(block.inputs.deck?.value || '');
      const count = runtime.getCardCount(deckId);
      return { success: true, value: count };
    });

    // 随机数
    this.registerHandler('sensing_random', async (block, context, runtime) => {
      const min = Number(block.inputs.min?.value) || 1;
      const max = Number(block.inputs.max?.value) || 6;
      const value = Math.floor(Math.random() * (max - min + 1)) + min;
      return { success: true, value };
    });

    // 随机布尔
    this.registerHandler('sensing_random_bool', async (block, context, runtime) => {
      return { success: true, value: Math.random() < 0.5 };
    });

    // 从列表随机选择
    this.registerHandler('sensing_random_from_list', async (block, context, runtime) => {
      const listName = String(block.inputs.list?.value || '');
      const list = context.lists.get(listName) || [];
      if (list.length === 0) return { success: true, value: null };
      const value = list[Math.floor(Math.random() * list.length)];
      return { success: true, value };
    });

    // 当前玩家
    this.registerHandler('sensing_current_player', async (block, context, runtime) => {
      return { success: true, value: context.currentPlayer };
    });

    // 所有玩家列表
    this.registerHandler('sensing_all_players', async (block, context, runtime) => {
      const project = runtime.getProject();
      const playerIds = project.players.map(p => p.id);
      return { success: true, value: playerIds };
    });

    // 获取正面形态
    this.registerHandler('sensing_get_front_face', async (block, context, runtime) => {
      const cardId = String(block.inputs.card?.value || '');
      const element = runtime.getElement(cardId);
      return { success: true, value: element?.image || null };
    });

    // 获取背面形态
    this.registerHandler('sensing_get_back_face', async (block, context, runtime) => {
      const cardId = String(block.inputs.card?.value || '');
      const element = runtime.getElement(cardId);
      return { success: true, value: element?.backImage || null };
    });

    // 是否在桌面上
    this.registerHandler('sensing_is_on_board', async (block, context, runtime) => {
      const elementId = String(block.inputs.element?.value || '');
      const element = runtime.getElement(elementId);
      return { success: true, value: element?.currentSlot !== undefined };
    });

    // 鼠标位置
    this.registerHandler('sensing_mouse_position', async (block, context, runtime) => {
      // 返回最后记录的鼠标位置
      return { success: true, value: { x: 0, y: 0 } };
    });

    // 当前点击的元素
    this.registerHandler('sensing_clicked_element', async (block, context, runtime) => {
      return { success: true, value: context.eventData?.elementId || null };
    });
  }

  // ===== 数据类处理器 =====
  private registerDataHandlers() {
    // 设置变量
    this.registerHandler('data_set_variable', async (block, context, runtime) => {
      const name = String(block.inputs.name?.value || '');
      const value = block.inputs.value?.value;
      
      if (name) {
        context.variables.set(name, value);
      }
      return { success: true };
    });

    // 增加变量
    this.registerHandler('data_add_variable', async (block, context, runtime) => {
      const name = String(block.inputs.name?.value || '');
      const value = Number(block.inputs.value?.value) || 0;
      
      if (name) {
        const current = Number(context.variables.get(name) || 0);
        context.variables.set(name, current + value);
      }
      return { success: true };
    });

    // 获取变量（输出积木）
    this.registerHandler('data_get_variable', async (block, context, runtime) => {
      const name = String(block.inputs.name?.value || '');
      const value = context.variables.get(name);
      return { success: true, value };
    });

    // 创建列表
    this.registerHandler('data_create_list', async (block, context, runtime) => {
      const name = String(block.inputs.name?.value || '');
      
      if (name) {
        context.lists.set(name, []);
      }
      return { success: true };
    });

    // 添加到列表
    this.registerHandler('data_add_to_list', async (block, context, runtime) => {
      const value = block.inputs.value?.value;
      const listName = String(block.inputs.list?.value || '');
      
      if (listName) {
        const list = context.lists.get(listName) || [];
        list.push(value);
        context.lists.set(listName, list);
      }
      return { success: true };
    });

    // 从列表删除
    this.registerHandler('data_delete_from_list', async (block, context, runtime) => {
      const listName = String(block.inputs.list?.value || '');
      const index = Number(block.inputs.index?.value) || 1;
      
      if (listName) {
        const list = context.lists.get(listName) || [];
        const actualIndex = index - 1; // 转换为0基索引
        if (actualIndex >= 0 && actualIndex < list.length) {
          list.splice(actualIndex, 1);
        }
      }
      return { success: true };
    });

    // 获取列表项
    this.registerHandler('data_get_from_list', async (block, context, runtime) => {
      const listName = String(block.inputs.list?.value || '');
      const index = Number(block.inputs.index?.value) || 1;
      
      if (listName) {
        const list = context.lists.get(listName) || [];
        const actualIndex = index - 1;
        const value = list[actualIndex];
        return { success: true, value };
      }
      return { success: true, value: null };
    });

    // 清空列表
    this.registerHandler('data_clear_list', async (block, context, runtime) => {
      const listName = String(block.inputs.list?.value || '');
      
      if (listName) {
        context.lists.set(listName, []);
      }
      return { success: true };
    });

    // 列表长度
    this.registerHandler('data_list_length', async (block, context, runtime) => {
      const listName = String(block.inputs.list?.value || '');
      const list = context.lists.get(listName) || [];
      return { success: true, value: list.length };
    });

    // 列表包含
    this.registerHandler('data_list_contains', async (block, context, runtime) => {
      const listName = String(block.inputs.list?.value || '');
      const value = block.inputs.value?.value;
      const list = context.lists.get(listName) || [];
      return { success: true, value: list.includes(value) };
    });

    // 设置玩家变量
    this.registerHandler('data_set_player_variable', async (block, context, runtime) => {
      const player = String(block.inputs.player?.value || 'current');
      const name = String(block.inputs.name?.value || '');
      const value = block.inputs.value?.value;
      
      const playerId = player === 'current' ? context.currentPlayer : player;
      runtime.setPlayerVariable(playerId, name, value);
      return { success: true };
    });

    // 获取玩家变量
    this.registerHandler('data_get_player_variable', async (block, context, runtime) => {
      const player = String(block.inputs.player?.value || 'current');
      const name = String(block.inputs.name?.value || '');
      
      const playerId = player === 'current' ? context.currentPlayer : player;
      const value = runtime.getPlayerVariable(playerId, name);
      return { success: true, value };
    });
  }

  // ===== 逻辑运算处理器 =====
  private registerOperatorHandlers() {
    // 且
    this.registerHandler('op_and', async (block, context, runtime) => {
      const a = block.inputs.a?.value as Block | undefined;
      const b = block.inputs.b?.value as Block | undefined;
      
      let valueA = false;
      let valueB = false;
      
      if (a) {
        const result = await this.executeBlock(a, context);
        valueA = result.success && !!result.value;
      }
      if (b) {
        const result = await this.executeBlock(b, context);
        valueB = result.success && !!result.value;
      }
      
      return { success: true, value: valueA && valueB };
    });

    // 或
    this.registerHandler('op_or', async (block, context, runtime) => {
      const a = block.inputs.a?.value as Block | undefined;
      const b = block.inputs.b?.value as Block | undefined;
      
      let valueA = false;
      let valueB = false;
      
      if (a) {
        const result = await this.executeBlock(a, context);
        valueA = result.success && !!result.value;
      }
      if (b) {
        const result = await this.executeBlock(b, context);
        valueB = result.success && !!result.value;
      }
      
      return { success: true, value: valueA || valueB };
    });

    // 非
    this.registerHandler('op_not', async (block, context, runtime) => {
      const a = block.inputs.a?.value as Block | undefined;
      
      let valueA = false;
      if (a) {
        const result = await this.executeBlock(a, context);
        valueA = result.success && !!result.value;
      }
      
      return { success: true, value: !valueA };
    });

    // 等于
    this.registerHandler('op_equals', async (block, context, runtime) => {
      const a = this.resolveValue(block.inputs.a?.value, context);
      const b = this.resolveValue(block.inputs.b?.value, context);
      return { success: true, value: a === b };
    });

    // 不等于
    this.registerHandler('op_not_equals', async (block, context, runtime) => {
      const a = this.resolveValue(block.inputs.a?.value, context);
      const b = this.resolveValue(block.inputs.b?.value, context);
      return { success: true, value: a !== b };
    });

    // 大于
    this.registerHandler('op_greater', async (block, context, runtime) => {
      const a = Number(this.resolveValue(block.inputs.a?.value, context)) || 0;
      const b = Number(this.resolveValue(block.inputs.b?.value, context)) || 0;
      return { success: true, value: a > b };
    });

    // 小于
    this.registerHandler('op_less', async (block, context, runtime) => {
      const a = Number(this.resolveValue(block.inputs.a?.value, context)) || 0;
      const b = Number(this.resolveValue(block.inputs.b?.value, context)) || 0;
      return { success: true, value: a < b };
    });

    // 大于等于
    this.registerHandler('op_greater_equal', async (block, context, runtime) => {
      const a = Number(this.resolveValue(block.inputs.a?.value, context)) || 0;
      const b = Number(this.resolveValue(block.inputs.b?.value, context)) || 0;
      return { success: true, value: a >= b };
    });

    // 小于等于
    this.registerHandler('op_less_equal', async (block, context, runtime) => {
      const a = Number(this.resolveValue(block.inputs.a?.value, context)) || 0;
      const b = Number(this.resolveValue(block.inputs.b?.value, context)) || 0;
      return { success: true, value: a <= b };
    });
  }

  // ===== 数学运算处理器 =====
  private registerMathHandlers() {
    // 加
    this.registerHandler('math_add', async (block, context, runtime) => {
      const a = Number(this.resolveValue(block.inputs.a?.value, context)) || 0;
      const b = Number(this.resolveValue(block.inputs.b?.value, context)) || 0;
      return { success: true, value: a + b };
    });

    // 减
    this.registerHandler('math_sub', async (block, context, runtime) => {
      const a = Number(this.resolveValue(block.inputs.a?.value, context)) || 0;
      const b = Number(this.resolveValue(block.inputs.b?.value, context)) || 0;
      return { success: true, value: a - b };
    });

    // 乘
    this.registerHandler('math_mul', async (block, context, runtime) => {
      const a = Number(this.resolveValue(block.inputs.a?.value, context)) || 0;
      const b = Number(this.resolveValue(block.inputs.b?.value, context)) || 0;
      return { success: true, value: a * b };
    });

    // 除
    this.registerHandler('math_div', async (block, context, runtime) => {
      const a = Number(this.resolveValue(block.inputs.a?.value, context)) || 0;
      const b = Number(this.resolveValue(block.inputs.b?.value, context)) || 1;
      return { success: true, value: b === 0 ? 0 : a / b };
    });

    // 取余
    this.registerHandler('math_mod', async (block, context, runtime) => {
      const a = Number(this.resolveValue(block.inputs.a?.value, context)) || 0;
      const b = Number(this.resolveValue(block.inputs.b?.value, context)) || 1;
      return { success: true, value: b === 0 ? 0 : a % b };
    });

    // 四舍五入
    this.registerHandler('math_round', async (block, context, runtime) => {
      const a = Number(this.resolveValue(block.inputs.a?.value, context)) || 0;
      return { success: true, value: Math.round(a) };
    });

    // 绝对值
    this.registerHandler('math_abs', async (block, context, runtime) => {
      const a = Number(this.resolveValue(block.inputs.a?.value, context)) || 0;
      return { success: true, value: Math.abs(a) };
    });

    // 取整
    this.registerHandler('math_floor', async (block, context, runtime) => {
      const a = Number(this.resolveValue(block.inputs.a?.value, context)) || 0;
      return { success: true, value: Math.floor(a) };
    });

    // 平方根
    this.registerHandler('math_sqrt', async (block, context, runtime) => {
      const a = Number(this.resolveValue(block.inputs.a?.value, context)) || 0;
      return { success: true, value: Math.sqrt(Math.max(0, a)) };
    });
  }

  // ===== 文本运算处理器 =====
  private registerTextHandlers() {
    // 连接
    this.registerHandler('text_concat', async (block, context, runtime) => {
      const a = String(this.resolveValue(block.inputs.a?.value, context) || '');
      const b = String(this.resolveValue(block.inputs.b?.value, context) || '');
      return { success: true, value: a + b };
    });

    // 长度
    this.registerHandler('text_length', async (block, context, runtime) => {
      const text = String(this.resolveValue(block.inputs.text?.value, context) || '');
      return { success: true, value: text.length };
    });

    // 查找
    this.registerHandler('text_index_of', async (block, context, runtime) => {
      const text = String(this.resolveValue(block.inputs.text?.value, context) || '');
      const sub = String(this.resolveValue(block.inputs.sub?.value, context) || '');
      return { success: true, value: text.indexOf(sub) + 1 }; // 1基索引
    });

    // 截取
    this.registerHandler('text_substring', async (block, context, runtime) => {
      const text = String(this.resolveValue(block.inputs.text?.value, context) || '');
      const start = Number(block.inputs.start?.value) || 1;
      const end = Number(block.inputs.end?.value) || text.length;
      return { success: true, value: text.substring(start - 1, end) };
    });

    // 转大写
    this.registerHandler('text_uppercase', async (block, context, runtime) => {
      const text = String(this.resolveValue(block.inputs.text?.value, context) || '');
      return { success: true, value: text.toUpperCase() };
    });

    // 转小写
    this.registerHandler('text_lowercase', async (block, context, runtime) => {
      const text = String(this.resolveValue(block.inputs.text?.value, context) || '');
      return { success: true, value: text.toLowerCase() };
    });
  }

  // ===== 自定义积木处理器 =====
  private registerCustomHandlers() {
    // 定义积木 - 这是一个声明，不需要执行
    this.registerHandler('custom_define', async (block, context, runtime) => {
      return { success: true };
    });

    // 调用积木
    this.registerHandler('custom_call', async (block, context, runtime) => {
      const name = String(block.inputs.name?.value || '');
      // 这里应该查找并执行对应的自定义积木定义
      runtime.addLog('info', `调用自定义积木: ${name}`);
      return { success: true };
    });
  }

  // ===== 辅助方法 =====

  // 获取子积木（简化实现）
  private getChildBlocks(parentBlock: Block): Block[] {
    // 实际实现应该根据积木的嵌套关系获取子积木
    // 这里简化处理，返回空数组
    return [];
  }

  // 解析值（处理嵌套积木或直接值）
  private resolveValue(value: any, context: ExecutionContext): any {
    if (value && typeof value === 'object' && 'type' in value && 'category' in value) {
      // 这是一个积木，需要执行它来获取值
      // 注意：这里简化处理，实际应该异步执行
      return null;
    }
    return value;
  }
}

// ============ 事件系统 ============

export interface EventListener {
  eventType: string;
  blocks: Block[];
  condition?: Block;
}

export class EventSystem {
  private listeners: Map<string, EventListener[]> = new Map();
  private interpreter: BlockInterpreter;
  private runtime: GameRuntime;

  constructor(interpreter: BlockInterpreter, runtime: GameRuntime) {
    this.interpreter = interpreter;
    this.runtime = runtime;
  }

  // 注册事件监听
  registerEvent(eventType: string, listener: EventListener) {
    const listeners = this.listeners.get(eventType) || [];
    listeners.push(listener);
    this.listeners.set(eventType, listeners);
  }

  // 触发事件
  async triggerEvent(eventType: string, eventData?: any, currentPlayer?: string): Promise<void> {
    const listeners = this.listeners.get(eventType) || [];
    const project = this.runtime.getProject();
    
    for (const listener of listeners) {
      // 创建执行上下文
      const context = createExecutionContext(currentPlayer || project.players[0]?.id || '', eventData);
      
      // 检查条件
      if (listener.condition) {
        const conditionResult = await this.interpreter.executeBlock(listener.condition, context);
        if (!conditionResult.success || !conditionResult.value) {
          continue;
        }
      }
      
      // 执行事件处理积木
      await this.interpreter.executeEvent(listener.blocks, context, listener.blocks);
    }
  }

  // 从项目中加载事件监听
  loadFromProject(project: Project) {
    this.listeners.clear();

    // 加载全局脚本中的事件
    this.loadEventBlocks(project.globalScript);

    // 加载元素脚本中的事件
    for (const element of project.elements) {
      this.loadEventBlocks(element.script, element.id);
    }
  }

  private loadEventBlocks(blocks: Block[], elementId?: string) {
    for (const block of blocks) {
      if (block.category === 'event') {
        const eventType = this.getEventType(block, elementId);
        if (eventType) {
          // 获取此事件积木后面的执行链
          const eventBlocks = this.getEventChainBlocks(block, blocks);
          this.registerEvent(eventType, {
            eventType,
            blocks: eventBlocks,
            condition: block.inputs.condition?.value as Block | undefined,
          });
        }
      }
    }
  }

  private getEventType(block: Block, elementId?: string): string | null {
    switch (block.type) {
      case 'event_game_start':
        return 'game:start';
      case 'event_broadcast':
        return `broadcast:${block.inputs.message?.value || ''}`;
      case 'event_condition_trigger':
        return 'condition:trigger';
      case 'event_element_click':
        const clickElement = block.inputs.element?.value || elementId;
        return `element:click:${clickElement}`;
      case 'event_turn_start':
        const player = block.inputs.player?.value;
        return player && player !== 'current' ? `turn:start:${player}` : 'turn:start';
      case 'event_deck_empty':
        const deck = block.inputs.deck?.value;
        return deck ? `deck:empty:${deck}` : 'deck:empty';
      case 'event_dice_roll':
        const dice = block.inputs.dice?.value;
        const number = block.inputs.number?.value;
        return dice ? `dice:roll:${dice}:${number}` : 'dice:roll';
      default:
        return null;
    }
  }

  private getEventChainBlocks(eventBlock: Block, allBlocks: Block[]): Block[] {
    // 获取事件积木后面的执行链
    const chain: Block[] = [];
    let currentId = eventBlock.next;
    
    while (currentId) {
      const block = allBlocks.find(b => b.id === currentId);
      if (!block) break;
      chain.push(block);
      currentId = block.next;
    }
    
    return chain;
  }
}

// 导出单例创建函数
export function createInterpreter(runtime: GameRuntime): BlockInterpreter {
  return new BlockInterpreter(runtime);
}

export function createEventSystem(interpreter: BlockInterpreter, runtime: GameRuntime): EventSystem {
  return new EventSystem(interpreter, runtime);
}