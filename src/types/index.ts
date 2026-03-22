// src/types/index.ts

export type ElementType = 'card' | 'prop' | 'deck';
export type BlockCategory = 'event' | 'control' | 'action' | 'sensing' | 'data' | 'operators' | 'custom';
export type ValueType = 'string' | 'number' | 'boolean' | 'element' | 'player' | 'list';

// 空白位状态类型
export type SlotStatus = 'normal' | 'locked' | 'highlighted' | 'unavailable' | 'selected';
export type SlotType = 'player' | 'public' | 'deck' | 'discard' | 'played';

// 空白位定义
export interface GridSlot {
  id: string;
  index: number;
  name?: string;
  type: SlotType;
  status: SlotStatus;
  playerId?: string; // 所属玩家（如果是玩家区域）
  elementId?: string; // 当前放置的元素ID
  x: number;
  y: number;
}

// 公共区域定义
export interface PublicArea {
  deckSlots: GridSlot[];    // 牌堆区域
  discardSlots: GridSlot[]; // 弃牌堆区域
  playedSlots: GridSlot[];  // 打出的牌区
}

export interface BlockInput {
  type: 'text' | 'number' | 'dropdown' | 'boolean' | 'block' | 'element' | 'player';
  value: any;
  options?: string[];
}

export interface Block {
  id: string;
  type: string;
  category: BlockCategory;
  label: string;
  inputs: Record<string, BlockInput>;
  next?: string;
  parent?: string;
  children?: Block[];  // 子积木列表（用于控制类积木）
  x?: number;
  y?: number;
}

// 卡牌在牌堆中的配置项
export interface DeckCardEntry {
  cardId: string;
  quantity: number; // 卡牌数量
}

// 牌堆内容配置
export interface DeckContent {
  cards: DeckCardEntry[]; // 卡牌列表及数量
}

export interface GameElement {
  id: string;
  name: string;
  description?: string; // 描述
  type: ElementType;
  image?: string;
  backImage?: string;
  color?: string; // 卡牌颜色/主题色
  properties: Record<string, {
    type: ValueType;
    value: any;
    label: string;
  }>;
  script: Block[];
  face: 'front' | 'back' | string; // 当前面，可以是任意字符串标识
  visible: boolean;
  currentSlot?: number;
  owner?: string;
  // 牌堆特有字段
  deckContent?: DeckContent; // 牌堆包含的卡牌
  // 卡牌特有字段
  cardType?: 'attack' | 'defense' | 'skill' | 'spell' | 'item'; // 卡牌类型标签
  quantity?: number; // 卡牌默认数量（在牌堆中的数量）
  // 多面态支持
  faces?: Record<string, {
    name: string;
    image?: string;
    properties?: Record<string, any>; // 该面特有的属性
  }>;
  // 道具特有字段
  propEffect?: string; // 道具效果描述
  useCount?: number; // 可使用次数
  maxUseCount?: number; // 最大使用次数
  iconType?: string; // 道具图标类型
}

export interface Player {
  id: string;
  name: string;
  color: string;
  type: 'human' | 'ai';
  handCards: string[];
  stats: Array<{
    key: string;
    name: string;
    defaultValue: number;
    suffix?: string;
  }>;
  properties: Record<string, {
    type: ValueType;
    value: any;
    label: string;
  }>;
  isActive: boolean;
  variables: Record<string, any>;
}

export interface Project {
  name: string;
  description?: string;
  author: string;
  version: string;
  settings: {
    playersCount: number;
    gridRows: number;
    gridCols: number;
    background: {
      type: 'solid' | 'gradient' | 'image';
      value: string;
    };
    gridStyle: 'none' | 'dots' | 'lines';
    playerColors: string[];
    publicAreaEnabled: boolean; // 是否启用公共区域
    slotNames?: Record<number, string>; // 空白位自定义名称
  };
  elements: GameElement[];
  players: Player[];
  gridSlots: GridSlot[]; // 所有空白位（包括玩家区域和公共区域）
  publicArea?: PublicArea; // 公共区域配置
  globalScript: Block[];
  variables: Record<string, { type: ValueType; value: any }>;
  lists: Record<string, { items: any[]; type: ValueType }>;
}

export interface RuntimeState {
  isPlaying: boolean;
  isPaused: boolean;
  speed: 'slow' | 'normal' | 'fast';
  currentPlayerIndex: number;
  currentPlayer: string;
  turnCount: number;
  phase: 'setup' | 'playing' | 'ended';
  logs: Array<{ type: 'info' | 'error' | 'broadcast'; message: string; timestamp: number }>;
  gridState: Record<number, string | null>;
  draggingElement: string | null;
  players: Record<string, {
    id: string;
    stats: Record<string, number>;
    handCards: string[];
  }>;
}