// src/lib/assets-library.ts
// 内置素材库

import { GameElement } from '@/types';

export interface AssetCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface AssetItem {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'card' | 'prop' | 'deck' | 'background' | 'icon';
  preview: string; // 预览图URL或base64
  data: any; // 具体数据，如GameElement的配置
}

// 素材分类
export const ASSET_CATEGORIES: AssetCategory[] = [
  {
    id: 'cards',
    name: '卡牌',
    description: '预设卡牌模板',
    icon: '🃏',
  },
  {
    id: 'props',
    name: '道具',
    description: '游戏道具',
    icon: '🎁',
  },
  {
    id: 'decks',
    name: '牌堆',
    description: '预设牌堆',
    icon: '📚',
  },
  {
    id: 'backgrounds',
    name: '背景',
    description: '游戏背景图片',
    icon: '🎨',
  },
  {
    id: 'icons',
    name: '图标',
    description: '游戏图标素材',
    icon: '✨',
  },
];

// 预设卡牌
export const PRESET_CARDS: AssetItem[] = [
  {
    id: 'card_attack',
    name: '攻击卡',
    description: '基础攻击卡牌',
    category: 'cards',
    type: 'card',
    preview: 'https://images.unsplash.com/photo-1611339555312-e607c83e7b6c?w=400&h=300&fit=crop',
    data: {
      name: '攻击',
      type: 'card',
      cardType: 'attack',
      color: '#FF6B6B',
      properties: {
        damage: { type: 'number', value: 5, label: '伤害值' },
        cost: { type: 'number', value: 1, label: '消耗' },
        target: { type: 'player', value: 'opponent', label: '目标' },
      },
      script: [],
    } as Partial<GameElement>,
  },
  {
    id: 'card_defense',
    name: '防御卡',
    description: '基础防御卡牌',
    category: 'cards',
    type: 'card',
    preview: 'https://images.unsplash.com/photo-1611339555312-e607c83e7b6c?w=400&h=300&fit=crop',
    data: {
      name: '防御',
      type: 'card',
      cardType: 'defense',
      color: '#4ECDC4',
      properties: {
        armor: { type: 'number', value: 3, label: '护甲值' },
        duration: { type: 'number', value: 1, label: '持续回合' },
      },
      script: [],
    } as Partial<GameElement>,
  },
  {
    id: 'card_heal',
    name: '治疗卡',
    description: '恢复生命值的卡牌',
    category: 'cards',
    type: 'card',
    preview: 'https://images.unsplash.com/photo-1611339555312-e607c83e7b6c?w=400&h=300&fit=crop',
    data: {
      name: '治疗',
      type: 'card',
      cardType: 'skill',
      color: '#06D6A0',
      properties: {
        heal: { type: 'number', value: 10, label: '治疗量' },
        target: { type: 'player', value: 'self', label: '目标' },
      },
      script: [],
    } as Partial<GameElement>,
  },
  {
    id: 'card_draw',
    name: '抽牌卡',
    description: '从牌堆抽牌的卡牌',
    category: 'cards',
    type: 'card',
    preview: 'https://images.unsplash.com/photo-1611339555312-e607c83e7b6c?w=400&h=300&fit=crop',
    data: {
      name: '抽牌',
      type: 'card',
      cardType: 'skill',
      color: '#118AB2',
      properties: {
        drawCount: { type: 'number', value: 2, label: '抽牌数量' },
      },
      script: [],
    } as Partial<GameElement>,
  },
];

// 预设道具
export const PRESET_PROPS: AssetItem[] = [
  {
    id: 'prop_potion',
    name: '生命药水',
    description: '恢复生命值的药水',
    category: 'props',
    type: 'prop',
    preview: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    data: {
      name: '生命药水',
      type: 'prop',
      color: '#EF476F',
      propEffect: '恢复10点生命值',
      useCount: 1,
      maxUseCount: 1,
      properties: {
        heal: { type: 'number', value: 10, label: '治疗量' },
      },
      script: [],
    } as Partial<GameElement>,
  },
  {
    id: 'prop_key',
    name: '钥匙',
    description: '开启宝箱的钥匙',
    category: 'props',
    type: 'prop',
    preview: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    data: {
      name: '钥匙',
      type: 'prop',
      color: '#FFD166',
      propEffect: '开启宝箱',
      useCount: 1,
      maxUseCount: 1,
      properties: {
        keyType: { type: 'string', value: 'golden', label: '钥匙类型' },
      },
      script: [],
    } as Partial<GameElement>,
  },
  {
    id: 'prop_scroll',
    name: '魔法卷轴',
    description: '释放魔法的卷轴',
    category: 'props',
    type: 'prop',
    preview: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    data: {
      name: '魔法卷轴',
      type: 'prop',
      color: '#7209B7',
      propEffect: '释放火球术',
      useCount: 3,
      maxUseCount: 3,
      properties: {
        damage: { type: 'number', value: 8, label: '伤害值' },
        element: { type: 'string', value: 'fire', label: '元素类型' },
      },
      script: [],
    } as Partial<GameElement>,
  },
];

// 预设牌堆
export const PRESET_DECKS: AssetItem[] = [
  {
    id: 'deck_starter',
    name: '新手牌堆',
    description: '包含基础卡牌的牌堆',
    category: 'decks',
    type: 'deck',
    preview: 'https://images.unsplash.com/photo-1611339555312-e607c83e7b6c?w=400&h=300&fit=crop',
    data: {
      name: '新手牌堆',
      type: 'deck',
      color: '#264653',
      deckContent: {
        cards: [
          { cardId: 'card_attack', quantity: 10 },
          { cardId: 'card_defense', quantity: 8 },
          { cardId: 'card_heal', quantity: 4 },
          { cardId: 'card_draw', quantity: 3 },
        ],
      },
      script: [],
    } as Partial<GameElement>,
  },
  {
    id: 'deck_magic',
    name: '魔法牌堆',
    description: '专注于魔法的牌堆',
    category: 'decks',
    type: 'deck',
    preview: 'https://images.unsplash.com/photo-1611339555312-e607c83e7b6c?w=400&h=300&fit=crop',
    data: {
      name: '魔法牌堆',
      type: 'deck',
      color: '#3A86FF',
      deckContent: {
        cards: [
          { cardId: 'card_attack', quantity: 6 },
          { cardId: 'prop_scroll', quantity: 4 },
        ],
      },
      script: [],
    } as Partial<GameElement>,
  },
];

// 预设背景
export const PRESET_BACKGROUNDS: AssetItem[] = [
  {
    id: 'bg_wood',
    name: '木质背景',
    description: '木质纹理背景',
    category: 'backgrounds',
    type: 'background',
    preview: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop',
    data: {
      type: 'image',
      value: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&h=900&fit=crop',
    },
  },
  {
    id: 'bg_fabric',
    name: '布料背景',
    description: '布料纹理背景',
    category: 'backgrounds',
    type: 'background',
    preview: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=400&h=300&fit=crop',
    data: {
      type: 'image',
      value: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1600&h=900&fit=crop',
    },
  },
  {
    id: 'bg_gradient_blue',
    name: '蓝色渐变',
    description: '蓝色渐变背景',
    category: 'backgrounds',
    type: 'background',
    preview: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
    data: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
  },
  {
    id: 'bg_gradient_sunset',
    name: '日落渐变',
    description: '日落色渐变背景',
    category: 'backgrounds',
    type: 'background',
    preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    data: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
  },
];

// 预设图标
export const PRESET_ICONS: AssetItem[] = [
  {
    id: 'icon_sword',
    name: '剑图标',
    description: '武器图标',
    category: 'icons',
    type: 'icon',
    preview: 'https://cdn-icons-png.flaticon.com/512/2972/2972544.png',
    data: {
      url: 'https://cdn-icons-png.flaticon.com/512/2972/2972544.png',
      type: 'weapon',
    },
  },
  {
    id: 'icon_shield',
    name: '盾牌图标',
    description: '防御图标',
    category: 'icons',
    type: 'icon',
    preview: 'https://cdn-icons-png.flaticon.com/512/2972/2972545.png',
    data: {
      url: 'https://cdn-icons-png.flaticon.com/512/2972/2972545.png',
      type: 'defense',
    },
  },
  {
    id: 'icon_potion',
    name: '药水图标',
    description: '治疗药水图标',
    category: 'icons',
    type: 'icon',
    preview: 'https://cdn-icons-png.flaticon.com/512/2972/2972546.png',
    data: {
      url: 'https://cdn-icons-png.flaticon.com/512/2972/2972546.png',
      type: 'potion',
    },
  },
  {
    id: 'icon_coin',
    name: '金币图标',
    description: '货币图标',
    category: 'icons',
    type: 'icon',
    preview: 'https://cdn-icons-png.flaticon.com/512/2972/2972547.png',
    data: {
      url: 'https://cdn-icons-png.flaticon.com/512/2972/2972547.png',
      type: 'currency',
    },
  },
];

// 所有素材
export const ALL_ASSETS: AssetItem[] = [
  ...PRESET_CARDS,
  ...PRESET_PROPS,
  ...PRESET_DECKS,
  ...PRESET_BACKGROUNDS,
  ...PRESET_ICONS,
];

// 根据ID获取素材
export function getAssetById(id: string): AssetItem | undefined {
  return ALL_ASSETS.find(asset => asset.id === id);
}

// 根据分类获取素材
export function getAssetsByCategory(categoryId: string): AssetItem[] {
  return ALL_ASSETS.filter(asset => asset.category === categoryId);
}

// 应用素材到项目
export function applyAssetToProject(asset: AssetItem, project: any): any {
  // 这里应该根据素材类型更新项目
  // 这是一个简化版本，实际实现需要更复杂的逻辑
  return project;
}