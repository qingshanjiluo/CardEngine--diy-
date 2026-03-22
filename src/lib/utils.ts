// src/lib/utils.ts

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 初始化网格空白位
export function initializeGridSlots(
  gridRows: number,
  gridCols: number,
  playersCount: number,
  publicAreaEnabled: boolean = true
): any[] {
  const slots: any[] = [];
  const totalPlayerSlots = gridRows * gridCols;
  
  // 为每个玩家创建玩家区域空白位
  for (let playerIndex = 0; playerIndex < playersCount; playerIndex++) {
    const playerId = `p${playerIndex + 1}`;
    
    for (let i = 0; i < totalPlayerSlots; i++) {
      const row = Math.floor(i / gridCols);
      const col = i % gridCols;
      const globalIndex = playerIndex * totalPlayerSlots + i;
      
      slots.push({
        id: `slot_${playerId}_${i}`,
        index: globalIndex,
        name: `玩家${playerIndex + 1}区域-${i + 1}`,
        type: 'player' as const,
        status: 'normal' as const,
        playerId,
        elementId: null,
        x: col,
        y: row + playerIndex * (gridRows + 1), // 为每个玩家区域添加垂直间距
      });
    }
  }
  
  // 添加公共区域空白位
  if (publicAreaEnabled) {
    // 牌堆区域 (3个位置)
    for (let i = 0; i < 3; i++) {
      slots.push({
        id: `slot_public_deck_${i}`,
        index: totalPlayerSlots * playersCount + i,
        name: i === 0 ? '主牌堆' : i === 1 ? '弃牌堆' : '打出区',
        type: i === 0 ? 'deck' : i === 1 ? 'discard' : 'played' as const,
        status: 'normal' as const,
        playerId: null,
        elementId: null,
        x: i,
        y: playersCount * (gridRows + 1), // 放在所有玩家区域下方
      });
    }
  }
  
  return slots;
}

// 初始化公共区域
export function initializePublicArea(): any {
  return {
    deckSlots: [],
    discardSlots: [],
    playedSlots: [],
  };
}