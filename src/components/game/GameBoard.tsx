// src/components/game/GameBoard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { GridSlot } from './GridSlot';
import { Users, Trophy } from 'lucide-react';

export function GameBoard() {
  const { project, runtime } = useStore();
  const { settings, players, gridSlots } = project;
  const { isPlaying, currentPlayerIndex } = runtime;

  // 按玩家和类型分组slot
  const playerSlots = gridSlots.filter(slot => slot.type === 'player');
  const publicSlots = gridSlots.filter(slot => slot.type !== 'player');
  
  // 计算最大x和y坐标用于布局
  const maxX = Math.max(...gridSlots.map(slot => slot.x), 0);
  const maxY = Math.max(...gridSlots.map(slot => slot.y), 0);

  return (
    <div className="space-y-4">
      {/* Players Info */}
      <div className="flex items-center gap-2">
        {players.map((player, index) => (
          <motion.div
            key={player.id}
            initial={false}
            animate={{
              scale: isPlaying && currentPlayerIndex === index ? 1.02 : 1,
              opacity: isPlaying && currentPlayerIndex === index ? 1 : 0.7
            }}
            className={cn(
              'flex-1 p-3 rounded-xl border-2 transition-all',
              isPlaying && currentPlayerIndex === index
                ? 'bg-white border-brand-500 shadow-md'
                : 'bg-white border-transparent'
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: player.color }}
              >
                {player.name.charAt(player.name.length - 1)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-800 truncate">
                  {player.name}
                  {isPlaying && currentPlayerIndex === index && (
                    <span className="ml-2 text-xs text-brand-600 font-medium">当前回合</span>
                  )}
                </p>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span>{player.handCards.length} 张手牌</span>
                  {Object.entries(player.properties).map(([key, prop]) => (
                    <span key={key}>
                      · {prop.label}: {prop.value}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Game Grid with Public Area */}
      <div
        className="relative bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm"
        style={{
          backgroundImage: project.settings.gridStyle !== 'none'
            ? `radial-gradient(circle at 1px 1px, #e5e5e5 1px, transparent 0)`
            : 'none',
          backgroundSize: '20px 20px'
        }}
      >
        {/* 玩家区域网格 */}
        <div
          className="relative"
          style={{
            width: '100%',
            height: `${(maxY + 1) * 80}px`, // 每个slot高度约80px
          }}
        >
          {gridSlots.map((slot) => (
            <div
              key={slot.id}
              className="absolute"
              style={{
                left: `${slot.x * 80}px`,
                top: `${slot.y * 80}px`,
                width: '72px',
                height: '72px',
              }}
            >
              <GridSlot slot={slot} />
            </div>
          ))}
        </div>

        {/* Turn Indicator */}
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-2 right-2 px-3 py-1 bg-brand-500 text-white text-xs font-medium rounded-full shadow-lg"
          >
            回合 {runtime.turnCount}
          </motion.div>
        )}
      </div>

      {/* Game Log */}
      {runtime.logs.length > 0 && (
        <div className="bg-neutral-900 rounded-xl p-3 max-h-32 overflow-auto">
          <div className="space-y-1">
            {runtime.logs.slice(-5).map((log, i) => (
              <div key={i} className="text-xs text-neutral-300 font-mono">
                <span className="text-neutral-500">[{new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>{' '}
                <span className={cn(
                  log.type === 'error' && 'text-red-400',
                  log.type === 'broadcast' && 'text-brand-400'
                )}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}