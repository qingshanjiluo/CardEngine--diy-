// src/lib/block-definitions.ts

import { BlockCategory } from '@/types';

export const BLOCK_DEFINITIONS: Record<string, {
  category: BlockCategory;
  label: string;
  inputs: Record<string, {
    type: string;
    value: any;
    options?: string[];
  }>;
  hasOutput?: boolean;
  outputType?: 'number' | 'string' | 'boolean' | 'element' | 'player';
  canContainChildren?: boolean;  // 是否可以包含子积木
}> = {
  // ========== 事件类 (Event) ==========
  'event_game_start': {
    category: 'event',
    label: '当游戏开始时',
    inputs: {}
  },
  'event_broadcast': {
    category: 'event',
    label: '当收到广播 %1',
    inputs: {
      message: { type: 'text', value: '消息名' },
      param: { type: 'text', value: '' }
    }
  },
  'event_condition_trigger': {
    category: 'event',
    label: '当 %1 触发',
    inputs: {
      condition: { type: 'block', value: null }
    }
  },
  'event_element_click': {
    category: 'event',
    label: '当 %1 被点击',
    inputs: {
      element: { type: 'element', value: '' }
    }
  },
  'event_turn_start': {
    category: 'event',
    label: '当切换到玩家 %1 的回合时',
    inputs: {
      player: { type: 'player', value: 'current' }
    }
  },
  'event_deck_empty': {
    category: 'event',
    label: '当牌堆 %1 被抽空时',
    inputs: {
      deck: { type: 'element', value: '' }
    }
  },
  'event_dice_roll': {
    category: 'event',
    label: '当骰子 %1 投出 %2 时',
    inputs: {
      dice: { type: 'element', value: '' },
      number: { type: 'number', value: 6 }
    }
  },

  // ========== 控制类 (Control) ==========
  'control_forever': {
    category: 'control',
    label: '重复执行',
    inputs: {},
    canContainChildren: true
  },
  'control_repeat_until': {
    category: 'control',
    label: '重复执行直到 %1',
    inputs: {
      condition: { type: 'block', value: null }
    },
    canContainChildren: true
  },
  'control_if': {
    category: 'control',
    label: '如果 %1 那么',
    inputs: {
      condition: { type: 'block', value: null }
    },
    canContainChildren: true
  },
  'control_if_else': {
    category: 'control',
    label: '如果 %1 那么 否则',
    inputs: {
      condition: { type: 'block', value: null }
    },
    canContainChildren: true
  },
  'control_break_if': {
    category: 'control',
    label: '当 %1 符合退出循环',
    inputs: {
      condition: { type: 'block', value: null }
    }
  },
  'control_return_if': {
    category: 'control',
    label: '当 %1 时返回 %2',
    inputs: {
      condition: { type: 'block', value: null },
      value: { type: 'text', value: '' }
    }
  },
  'control_broadcast': {
    category: 'control',
    label: '广播 %1',
    inputs: {
      message: { type: 'text', value: '消息名' },
      param: { type: 'text', value: '' }
    }
  },
  'control_broadcast_wait': {
    category: 'control',
    label: '广播 %1 并等待',
    inputs: {
      message: { type: 'text', value: '消息名' },
      param: { type: 'text', value: '' }
    }
  },
  'control_wait': {
    category: 'control',
    label: '等待 %1 秒',
    inputs: {
      seconds: { type: 'number', value: 1 }
    }
  },
  'control_wait_until': {
    category: 'control',
    label: '等待直到 %1',
    inputs: {
      condition: { type: 'block', value: null }
    }
  },

  // ========== 动作类 (Action) ==========
  'action_move': {
    category: 'action',
    label: '移动 %1 到 %2',
    inputs: {
      element: { type: 'element', value: '' },
      slot: { type: 'number', value: 0 }
    }
  },
  'action_create': {
    category: 'action',
    label: '创建 %1 在 %2',
    inputs: {
      template: { type: 'element', value: '' },
      slot: { type: 'number', value: 0 }
    }
  },
  'action_delete': {
    category: 'action',
    label: '删除 %1',
    inputs: {
      element: { type: 'element', value: '' }
    }
  },
  'action_set_property': {
    category: 'action',
    label: '修改 %1 的 %2 为 %3',
    inputs: {
      element: { type: 'element', value: '' },
      property: { type: 'text', value: '属性名' },
      value: { type: 'text', value: '' }
    }
  },
  'action_draw_cards': {
    category: 'action',
    label: '抽取 %1 张牌从 %2 到 %3',
    inputs: {
      count: { type: 'number', value: 1 },
      deck: { type: 'element', value: '' },
      target: { type: 'player', value: 'current' }
    }
  },
  'action_shuffle': {
    category: 'action',
    label: '洗牌 %1',
    inputs: {
      deck: { type: 'element', value: '' }
    }
  },
  'action_flip': {
    category: 'action',
    label: '翻转 %1',
    inputs: {
      card: { type: 'element', value: '' }
    }
  },
  'action_show': {
    category: 'action',
    label: '显示 %1',
    inputs: {
      element: { type: 'element', value: '' }
    }
  },
  'action_hide': {
    category: 'action',
    label: '隐藏 %1',
    inputs: {
      element: { type: 'element', value: '' }
    }
  },
  'action_set_player_property': {
    category: 'action',
    label: '设置 %1 的 %2 为 %3',
    inputs: {
      player: { type: 'player', value: 'current' },
      property: { type: 'text', value: '生命值' },
      value: { type: 'number', value: 0 }
    }
  },
  'action_add_player_property': {
    category: 'action',
    label: '增加 %1 的 %2 %3',
    inputs: {
      player: { type: 'player', value: 'current' },
      property: { type: 'text', value: '生命值' },
      value: { type: 'number', value: 1 }
    }
  },
  'action_play_sound': {
    category: 'action',
    label: '播放音效 %1',
    inputs: {
      sound: { type: 'text', value: 'click', options: ['click', 'shuffle', 'draw', 'win', 'lose'] }
    }
  },
  'action_set_current_player': {
    category: 'action',
    label: '设置 %1 为当前回合',
    inputs: {
      player: { type: 'player', value: 'current' }
    }
  },
  'action_end_turn': {
    category: 'action',
    label: '结束当前回合',
    inputs: {}
  },
  'action_reset_game': {
    category: 'action',
    label: '重置游戏',
    inputs: {}
  },

  // ========== 侦测类 (Sensing) ==========
  'sensing_at_slot': {
    category: 'sensing',
    label: '处于 %1 的元素',
    inputs: {
      slot: { type: 'number', value: 0 }
    },
    hasOutput: true,
    outputType: 'element'
  },
  'sensing_slot_occupied': {
    category: 'sensing',
    label: '%1 是否被占据？',
    inputs: {
      slot: { type: 'number', value: 0 }
    },
    hasOutput: true,
    outputType: 'boolean'
  },
  'sensing_get_property': {
    category: 'sensing',
    label: '%1 的 %2',
    inputs: {
      element: { type: 'element', value: '' },
      property: { type: 'text', value: '攻击力' }
    },
    hasOutput: true
  },
  'sensing_get_player_property': {
    category: 'sensing',
    label: '%1 的 %2',
    inputs: {
      player: { type: 'player', value: 'current' },
      property: { type: 'text', value: '生命值' }
    },
    hasOutput: true
  },
  'sensing_hand_count': {
    category: 'sensing',
    label: '%1 的手牌数量',
    inputs: {
      player: { type: 'player', value: 'current' }
    },
    hasOutput: true,
    outputType: 'number'
  },
  'sensing_deck_count': {
    category: 'sensing',
    label: '%1 的剩余张数',
    inputs: {
      deck: { type: 'element', value: '' }
    },
    hasOutput: true,
    outputType: 'number'
  },
  'sensing_random': {
    category: 'sensing',
    label: '随机数介于 %1 到 %2',
    inputs: {
      min: { type: 'number', value: 1 },
      max: { type: 'number', value: 6 }
    },
    hasOutput: true,
    outputType: 'number'
  },
  'sensing_random_bool': {
    category: 'sensing',
    label: '随机布尔值',
    inputs: {},
    hasOutput: true,
    outputType: 'boolean'
  },
  'sensing_random_from_list': {
    category: 'sensing',
    label: '随机从 %1 中选择',
    inputs: {
      list: { type: 'text', value: '' }
    },
    hasOutput: true
  },
  'sensing_current_player': {
    category: 'sensing',
    label: '当前玩家',
    inputs: {},
    hasOutput: true,
    outputType: 'player'
  },
  'sensing_all_players': {
    category: 'sensing',
    label: '所有玩家列表',
    inputs: {},
    hasOutput: true
  },
  'sensing_get_front_face': {
    category: 'sensing',
    label: '%1 的正面形态',
    inputs: {
      card: { type: 'element', value: '' }
    },
    hasOutput: true
  },
  'sensing_get_back_face': {
    category: 'sensing',
    label: '%1 的背面形态',
    inputs: {
      card: { type: 'element', value: '' }
    },
    hasOutput: true
  },
  'sensing_is_on_board': {
    category: 'sensing',
    label: '%1 是否在桌面上？',
    inputs: {
      element: { type: 'element', value: '' }
    },
    hasOutput: true,
    outputType: 'boolean'
  },
  'sensing_mouse_position': {
    category: 'sensing',
    label: '鼠标/触摸位置',
    inputs: {},
    hasOutput: true
  },
  'sensing_clicked_element': {
    category: 'sensing',
    label: '当前点击的元素',
    inputs: {},
    hasOutput: true,
    outputType: 'element'
  },

  // ========== 数据类 (Data) ==========
  'data_set_variable': {
    category: 'data',
    label: '设置变量 %1 为 %2',
    inputs: {
      name: { type: 'text', value: '变量名' },
      value: { type: 'text', value: '' }
    }
  },
  'data_add_variable': {
    category: 'data',
    label: '将变量 %1 增加 %2',
    inputs: {
      name: { type: 'text', value: '变量名' },
      value: { type: 'number', value: 1 }
    }
  },
  'data_get_variable': {
    category: 'data',
    label: '变量 %1',
    inputs: {
      name: { type: 'text', value: '变量名' }
    },
    hasOutput: true
  },
  'data_create_list': {
    category: 'data',
    label: '创建列表 %1',
    inputs: {
      name: { type: 'text', value: '列表名' }
    }
  },
  'data_add_to_list': {
    category: 'data',
    label: '将 %1 加入 %2',
    inputs: {
      value: { type: 'text', value: '' },
      list: { type: 'text', value: '列表名' }
    }
  },
  'data_delete_from_list': {
    category: 'data',
    label: '删除 %1 的第 %2 项',
    inputs: {
      list: { type: 'text', value: '列表名' },
      index: { type: 'number', value: 1 }
    }
  },
  'data_get_from_list': {
    category: 'data',
    label: '获取 %1 的第 %2 项',
    inputs: {
      list: { type: 'text', value: '列表名' },
      index: { type: 'number', value: 1 }
    },
    hasOutput: true
  },
  'data_clear_list': {
    category: 'data',
    label: '清空 %1',
    inputs: {
      list: { type: 'text', value: '列表名' }
    }
  },
  'data_list_length': {
    category: 'data',
    label: '列表 %1 的长度',
    inputs: {
      list: { type: 'text', value: '列表名' }
    },
    hasOutput: true,
    outputType: 'number'
  },
  'data_list_contains': {
    category: 'sensing',
    label: '列表 %1 包含 %2？',
    inputs: {
      list: { type: 'text', value: '列表名' },
      value: { type: 'text', value: '' }
    },
    hasOutput: true,
    outputType: 'boolean'
  },
  'data_set_player_variable': {
    category: 'data',
    label: '设置 %1 的变量 %2 为 %3',
    inputs: {
      player: { type: 'player', value: 'current' },
      name: { type: 'text', value: '变量名' },
      value: { type: 'text', value: '' }
    }
  },
  'data_get_player_variable': {
    category: 'data',
    label: '%1 的变量 %2',
    inputs: {
      player: { type: 'player', value: 'current' },
      name: { type: 'text', value: '变量名' }
    },
    hasOutput: true
  },

  // ========== 逻辑运算 (Operators) ==========
  'op_and': {
    category: 'operators',
    label: '%1 且 %2',
    inputs: {
      a: { type: 'block', value: null },
      b: { type: 'block', value: null }
    },
    hasOutput: true,
    outputType: 'boolean'
  },
  'op_or': {
    category: 'operators',
    label: '%1 或 %2',
    inputs: {
      a: { type: 'block', value: null },
      b: { type: 'block', value: null }
    },
    hasOutput: true,
    outputType: 'boolean'
  },
  'op_not': {
    category: 'operators',
    label: '非 %1',
    inputs: {
      a: { type: 'block', value: null }
    },
    hasOutput: true,
    outputType: 'boolean'
  },
  'op_equals': {
    category: 'operators',
    label: '%1 等于 %2',
    inputs: {
      a: { type: 'text', value: '' },
      b: { type: 'text', value: '' }
    },
    hasOutput: true,
    outputType: 'boolean'
  },
  'op_not_equals': {
    category: 'operators',
    label: '%1 ≠ %2',
    inputs: {
      a: { type: 'text', value: '' },
      b: { type: 'text', value: '' }
    },
    hasOutput: true,
    outputType: 'boolean'
  },
  'op_greater': {
    category: 'operators',
    label: '%1 > %2',
    inputs: {
      a: { type: 'number', value: 0 },
      b: { type: 'number', value: 0 }
    },
    hasOutput: true,
    outputType: 'boolean'
  },
  'op_less': {
    category: 'operators',
    label: '%1 < %2',
    inputs: {
      a: { type: 'number', value: 0 },
      b: { type: 'number', value: 0 }
    },
    hasOutput: true,
    outputType: 'boolean'
  },
  'op_greater_equal': {
    category: 'operators',
    label: '%1 ≥ %2',
    inputs: {
      a: { type: 'number', value: 0 },
      b: { type: 'number', value: 0 }
    },
    hasOutput: true,
    outputType: 'boolean'
  },
  'op_less_equal': {
    category: 'operators',
    label: '%1 ≤ %2',
    inputs: {
      a: { type: 'number', value: 0 },
      b: { type: 'number', value: 0 }
    },
    hasOutput: true,
    outputType: 'boolean'
  },

  // ========== 数学运算 (Math) ==========
  'math_add': {
    category: 'operators',
    label: '%1 + %2',
    inputs: {
      a: { type: 'number', value: 0 },
      b: { type: 'number', value: 0 }
    },
    hasOutput: true,
    outputType: 'number'
  },
  'math_sub': {
    category: 'operators',
    label: '%1 - %2',
    inputs: {
      a: { type: 'number', value: 0 },
      b: { type: 'number', value: 0 }
    },
    hasOutput: true,
    outputType: 'number'
  },
  'math_mul': {
    category: 'operators',
    label: '%1 × %2',
    inputs: {
      a: { type: 'number', value: 0 },
      b: { type: 'number', value: 0 }
    },
    hasOutput: true,
    outputType: 'number'
  },
  'math_div': {
    category: 'operators',
    label: '%1 ÷ %2',
    inputs: {
      a: { type: 'number', value: 0 },
      b: { type: 'number', value: 1 }
    },
    hasOutput: true,
    outputType: 'number'
  },
  'math_mod': {
    category: 'operators',
    label: '%1 的余数 %2',
    inputs: {
      a: { type: 'number', value: 0 },
      b: { type: 'number', value: 2 }
    },
    hasOutput: true,
    outputType: 'number'
  },
  'math_round': {
    category: 'operators',
    label: '四舍五入 %1',
    inputs: {
      a: { type: 'number', value: 0 }
    },
    hasOutput: true,
    outputType: 'number'
  },
  'math_abs': {
    category: 'operators',
    label: '绝对值 %1',
    inputs: {
      a: { type: 'number', value: 0 }
    },
    hasOutput: true,
    outputType: 'number'
  },
  'math_floor': {
    category: 'operators',
    label: '取整 %1',
    inputs: {
      a: { type: 'number', value: 0 }
    },
    hasOutput: true,
    outputType: 'number'
  },
  'math_sqrt': {
    category: 'operators',
    label: '平方根 %1',
    inputs: {
      a: { type: 'number', value: 0 }
    },
    hasOutput: true,
    outputType: 'number'
  },

  // ========== 文本运算 (Text) ==========
  'text_concat': {
    category: 'operators',
    label: '连接 %1 和 %2',
    inputs: {
      a: { type: 'text', value: '' },
      b: { type: 'text', value: '' }
    },
    hasOutput: true,
    outputType: 'string'
  },
  'text_length': {
    category: 'operators',
    label: '获取 %1 的长度',
    inputs: {
      text: { type: 'text', value: '' }
    },
    hasOutput: true,
    outputType: 'number'
  },
  'text_index_of': {
    category: 'operators',
    label: '在 %1 中查找 %2',
    inputs: {
      text: { type: 'text', value: '' },
      sub: { type: 'text', value: '' }
    },
    hasOutput: true,
    outputType: 'number'
  },
  'text_substring': {
    category: 'operators',
    label: '截取 %1 从 %2 到 %3',
    inputs: {
      text: { type: 'text', value: '' },
      start: { type: 'number', value: 1 },
      end: { type: 'number', value: 1 }
    },
    hasOutput: true,
    outputType: 'string'
  },
  'text_uppercase': {
    category: 'operators',
    label: '将 %1 转为大写',
    inputs: {
      text: { type: 'text', value: '' }
    },
    hasOutput: true,
    outputType: 'string'
  },
  'text_lowercase': {
    category: 'operators',
    label: '将 %1 转为小写',
    inputs: {
      text: { type: 'text', value: '' }
    },
    hasOutput: true,
    outputType: 'string'
  },

  // ========== 自定义积木 (Custom) ==========
  'custom_define': {
    category: 'custom',
    label: '定义 %1',
    inputs: {
      name: { type: 'text', value: '积木名' },
      params: { type: 'text', value: '' }
    }
  },
  'custom_call': {
    category: 'custom',
    label: '调用 %1',
    inputs: {
      name: { type: 'text', value: '积木名' },
      args: { type: 'text', value: '' }
    }
  },
};

// 积木分类配置
export const BLOCK_CATEGORIES = [
  { id: 'event', label: '事件', color: '#F59E0B', icon: 'Zap' },
  { id: 'control', label: '控制', color: '#10B981', icon: 'GitBranch' },
  { id: 'action', label: '动作', color: '#5686FE', icon: 'Play' },
  { id: 'sensing', label: '侦测', color: '#8B5CF6', icon: 'Eye' },
  { id: 'data', label: '数据', color: '#EC4899', icon: 'Database' },
  { id: 'operators', label: '运算', color: '#14B8A6', icon: 'Calculator' },
  { id: 'custom', label: '自定义', color: '#64748B', icon: 'Puzzle' },
] as const;

// 获取分类下的所有积木
export function getBlocksByCategory(category: BlockCategory) {
  return Object.entries(BLOCK_DEFINITIONS)
    .filter(([_, def]) => def.category === category)
    .map(([type, def]) => ({ type, ...def }));
}

// 获取单个积木定义
export function getBlockDefinition(blockType: string) {
  return BLOCK_DEFINITIONS[blockType];
}

// 积木定义类型
export type BlockDefinition = typeof BLOCK_DEFINITIONS[string];