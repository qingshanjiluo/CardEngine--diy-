// src/components/game/PlayerPanel.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Coins, Heart, Shield } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  playerId: string;
  isActive: boolean;
}

function PlayerCard({ playerId, isActive }: PlayerCardProps) {
  const { runtime, project } = useStore();
  const player = project.players.find(p => p.id === playerId);
  const playerState = runtime.players[playerId];
  
  if (!player || !playerState) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 rounded-xl border-2 transition-all duration-300',
        isActive 
          ? 'border-[#5686FE] bg-blue-50/50 shadow-lg shadow-blue-500/10' 
          : 'border-neutral-200 bg-white'
      )}
    >
      {/* Player Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          isActive ? 'bg-[#5686FE] text-white' : 'bg-neutral-100 text-neutral-500'
        )}>
          <User className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-900">{player.name}</span>
            {isActive && (
              <span className="px-2 py-0.5 bg-[#5686FE] text-white text-xs rounded-full">
                当前回合
              </span>
            )}
          </div>
          <span className="text-xs text-neutral-400">{player.type === 'human' ? '玩家' : '电脑'}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        {player.stats.map((stat) => {
          const value = playerState.stats[stat.key] ?? stat.defaultValue;
          const Icon = stat.key === 'hp' ? Heart : stat.key === 'gold' ? Coins : Shield;
          
          return (
            <div 
              key={stat.key}
              className="flex items-center gap-1.5 px-2 py-1.5 bg-white rounded-lg border border-neutral-100"
            >
              <Icon className={cn(
                'w-3.5 h-3.5',
                stat.key === 'hp' ? 'text-rose-500' :
                stat.key === 'gold' ? 'text-amber-500' : 'text-blue-500'
              )} />
              <span className="text-sm font-medium text-neutral-700">
                {value}{stat.suffix || ''}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function PlayerPanel() {
  const { project, runtime } = useStore();
  
  return (
    <div className="p-4 space-y-3">
      <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">
        玩家信息
      </h3>
      {project.players.map((player) => (
        <PlayerCard
          key={player.id}
          playerId={player.id}
          isActive={runtime.currentPlayer === player.id}
        />
      ))}
    </div>
  );
}
