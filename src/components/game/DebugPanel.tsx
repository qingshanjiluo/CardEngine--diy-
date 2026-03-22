// src/components/game/DebugPanel.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Bug, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';

interface DebugPanelProps {
  className?: string;
}

export function DebugPanel({ className }: DebugPanelProps) {
  const { project, runtime, execution } = useStore();
  const { players, variables, lists } = project;
  const { isPlaying, currentPlayer, turnCount, phase } = runtime;
  const { isExecuting, currentBlockId, executingBlockIds, lastError } = execution;

  const [expandedSections, setExpandedSections] = React.useState({
    players: true,
    variables: true,
    lists: true,
    execution: true,
    runtime: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className={cn('bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-neutral-50">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-brand-500" />
          <h3 className="text-sm font-semibold text-neutral-800">调试面板</h3>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-brand-100 text-brand-700">
            {isPlaying ? '运行中' : '停止'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>回合: {turnCount}</span>
          <span className="w-px h-3 bg-neutral-300" />
          <span>阶段: {phase}</span>
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-neutral-100">
        {/* Players Section */}
        <div className="p-3">
          <button
            onClick={() => toggleSection('players')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              {expandedSections.players ? (
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              )}
              <span className="text-sm font-medium text-neutral-700">玩家状态</span>
              <span className="text-xs text-neutral-500">({players.length})</span>
            </div>
            <span className="text-xs text-neutral-500">点击展开/折叠</span>
          </button>
          
          {expandedSections.players && (
            <div className="mt-3 space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={cn(
                    'p-3 rounded-lg border',
                    currentPlayer === player.id
                      ? 'border-brand-300 bg-brand-50'
                      : 'border-neutral-200 bg-neutral-50'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: player.color }}
                      />
                      <span className="text-sm font-medium text-neutral-800">
                        {player.name}
                        {currentPlayer === player.id && (
                          <span className="ml-2 text-xs text-brand-600 font-medium">当前玩家</span>
                        )}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-500">
                      {player.handCards.length} 张手牌
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(player.properties).map(([key, prop]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-neutral-600">{prop.label}:</span>
                        <span className="font-mono font-medium">{prop.value}</span>
                      </div>
                    ))}
                    
                    {Object.entries(player.variables).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-neutral-600">{key}:</span>
                        <span className="font-mono font-medium">{JSON.stringify(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Variables Section */}
        <div className="p-3">
          <button
            onClick={() => toggleSection('variables')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              {expandedSections.variables ? (
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              )}
              <span className="text-sm font-medium text-neutral-700">全局变量</span>
              <span className="text-xs text-neutral-500">({Object.keys(variables).length})</span>
            </div>
            <span className="text-xs text-neutral-500">点击展开/折叠</span>
          </button>
          
          {expandedSections.variables && (
            <div className="mt-3 space-y-1">
              {Object.entries(variables).map(([key, variable]) => (
                <div key={key} className="flex items-center justify-between p-2 rounded bg-neutral-50">
                  <span className="text-sm text-neutral-700 font-mono">{key}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">{variable.type}</span>
                    <span className="text-sm font-medium text-neutral-900">
                      {JSON.stringify(variable.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lists Section */}
        <div className="p-3">
          <button
            onClick={() => toggleSection('lists')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              {expandedSections.lists ? (
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              )}
              <span className="text-sm font-medium text-neutral-700">列表</span>
              <span className="text-xs text-neutral-500">({Object.keys(lists).length})</span>
            </div>
            <span className="text-xs text-neutral-500">点击展开/折叠</span>
          </button>
          
          {expandedSections.lists && (
            <div className="mt-3 space-y-1">
              {Object.entries(lists).map(([key, list]) => (
                <div key={key} className="p-2 rounded bg-neutral-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-700 font-mono">{key}</span>
                    <span className="text-xs text-neutral-500">
                      {list.items.length} 项 · {list.type}
                    </span>
                  </div>
                  {list.items.length > 0 ? (
                    <div className="text-xs text-neutral-600 truncate">
                      {list.items.slice(0, 3).map((item, i) => (
                        <span key={i} className="mr-1">
                          {JSON.stringify(item)}
                          {i < Math.min(2, list.items.length - 1) && ','}
                        </span>
                      ))}
                      {list.items.length > 3 && (
                        <span className="text-neutral-400">... 等 {list.items.length} 项</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-neutral-400 italic">空列表</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Execution State */}
        <div className="p-3">
          <button
            onClick={() => toggleSection('execution')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              {expandedSections.execution ? (
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              )}
              <span className="text-sm font-medium text-neutral-700">执行状态</span>
              <span className="text-xs text-neutral-500">
                {isExecuting ? '执行中' : '空闲'}
              </span>
            </div>
            <span className="text-xs text-neutral-500">点击展开/折叠</span>
          </button>
          
          {expandedSections.execution && (
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 rounded bg-neutral-50">
                  <div className="text-xs text-neutral-500 mb-1">当前积木</div>
                  <div className="font-mono text-sm truncate">
                    {currentBlockId || '无'}
                  </div>
                </div>
                <div className="p-2 rounded bg-neutral-50">
                  <div className="text-xs text-neutral-500 mb-1">执行中积木</div>
                  <div className="font-mono text-sm">
                    {executingBlockIds.size} 个
                  </div>
                </div>
              </div>
              
              {lastError && (
                <div className="p-2 rounded bg-red-50 border border-red-200">
                  <div className="text-xs text-red-600 font-medium mb-1">错误</div>
                  <div className="text-sm text-red-700 font-mono truncate">{lastError}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Runtime Info */}
        <div className="p-3">
          <button
            onClick={() => toggleSection('runtime')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              {expandedSections.runtime ? (
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              )}
              <span className="text-sm font-medium text-neutral-700">运行时信息</span>
            </div>
            <span className="text-xs text-neutral-500">点击展开/折叠</span>
          </button>
          
          {expandedSections.runtime && (
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex items-center justify-between p-2 rounded bg-neutral-50">
                <span className="text-neutral-600">游戏状态</span>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  isPlaying
                    ? 'bg-green-100 text-green-700'
                    : 'bg-neutral-100 text-neutral-700'
                )}>
                  {isPlaying ? '运行中' : '停止'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-neutral-50">
                <span className="text-neutral-600">当前阶段</span>
                <span className="font-medium text-neutral-800">{phase}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-neutral-50">
                <span className="text-neutral-600">回合计数</span>
                <span className="font-mono font-medium">{turnCount}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-neutral-50">
                <span className="text-neutral-600">执行速度</span>
                <span className="font-medium text-neutral-800">
                  {runtime.speed === 'slow' ? '慢速' : runtime.speed === 'fast' ? '快速' : '正常'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}