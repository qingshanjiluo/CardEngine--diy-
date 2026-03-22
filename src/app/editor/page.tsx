// src/app/editor/page.tsx
'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BlockPalette } from '@/components/blocks/BlockPalette';
import { BlockCanvas } from '@/components/blocks/BlockCanvas';
import { GameBoard } from '@/components/game/GameBoard';
import { ElementPanel } from '@/components/game/ElementPanel';
import { BroadcastMessage } from '@/components/game/BroadcastMessage';
import { DebugPanel } from '@/components/game/DebugPanel';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Layers, Play, Code2 } from 'lucide-react';

export default function EditorPage() {
  const { currentPage } = useStore();
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [activeBottomTab, setActiveBottomTab] = useState<'elements' | 'console'>('elements');
  const [activeRightTab, setActiveRightTab] = useState<'preview' | 'debug'>('preview');

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <BroadcastMessage />
      
      <main className="pt-16 h-screen flex flex-col">
        {/* Main Editor Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Block Palette */}
          <div className="hidden lg:flex w-72 flex-shrink-0 bg-white border-r border-neutral-200 flex-col">
            <div className="h-12 px-4 flex items-center border-b border-neutral-100">
              <Code2 className="w-4 h-4 text-brand-500 mr-2" />
              <span className="text-sm font-semibold text-neutral-800">积木库</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <BlockPalette />
            </div>
          </div>

          {/* Mobile block palette toggle */}
          <div className="lg:hidden fixed bottom-4 left-4 z-50">
            <button
              onClick={() => {
                // 这里可以添加移动端积木库抽屉
                alert('移动端积木库功能正在开发中');
              }}
              className="bg-brand-500 text-white p-3 rounded-full shadow-lg hover:bg-brand-600 transition-colors"
            >
              <Code2 className="w-5 h-5" />
            </button>
          </div>

          {/* Center - Code Canvas */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-hidden">
              <BlockCanvas />
            </div>
            
            {/* Bottom Panel - Elements/Console */}
            <div className="h-48 md:h-64 bg-white border-t border-neutral-200 flex flex-col">
              <div className="flex items-center px-4 border-b border-neutral-100">
                <button
                  onClick={() => setActiveBottomTab('elements')}
                  className={cn(
                    'px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center',
                    activeBottomTab === 'elements'
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700'
                  )}
                >
                  <Layers className="w-4 h-4 inline mr-1" />
                  <span className="hidden sm:inline">元素管理</span>
                  <span className="sm:hidden">元素</span>
                </button>
                <button
                  onClick={() => setActiveBottomTab('console')}
                  className={cn(
                    'px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center',
                    activeBottomTab === 'console'
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700'
                  )}
                >
                  <Play className="w-4 h-4 inline mr-1" />
                  <span className="hidden sm:inline">运行日志</span>
                  <span className="sm:hidden">日志</span>
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {activeBottomTab === 'elements' ? <ElementPanel /> : <ConsolePanel />}
              </div>
            </div>
          </div>

          {/* Right Panel - Game Preview */}
          <div
            className={cn(
              'hidden lg:flex flex-shrink-0 bg-white border-l border-neutral-200 transition-all duration-300 flex-col',
              showRightPanel ? 'w-96' : 'w-0 overflow-hidden'
            )}
          >
            {showRightPanel && (
              <>
                <div className="h-12 px-4 flex items-center justify-between border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveRightTab('preview')}
                      className={cn(
                        'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                        activeRightTab === 'preview'
                          ? 'bg-brand-100 text-brand-700'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      )}
                    >
                      游戏预览
                    </button>
                    <button
                      onClick={() => setActiveRightTab('debug')}
                      className={cn(
                        'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                        activeRightTab === 'debug'
                          ? 'bg-brand-100 text-brand-700'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      )}
                    >
                      调试面板
                    </button>
                  </div>
                  <button
                    onClick={() => setShowRightPanel(false)}
                    className="p-1 hover:bg-neutral-100 rounded"
                  >
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  {activeRightTab === 'preview' ? <GameBoard /> : <DebugPanel />}
                </div>
              </>
            )}
          </div>
          
          {/* Toggle Right Panel Button */}
          {!showRightPanel && (
            <button
              onClick={() => setShowRightPanel(true)}
              className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-neutral-200 border-r-0 rounded-l-lg p-2 shadow-lg hover:bg-neutral-50"
            >
              <ChevronLeft className="w-4 h-4 text-neutral-400" />
            </button>
          )}

          {/* Mobile game preview toggle */}
          <div className="lg:hidden fixed bottom-4 right-4 z-50">
            <button
              onClick={() => {
                // 这里可以添加移动端游戏预览抽屉
                alert('移动端游戏预览功能正在开发中');
              }}
              className="bg-brand-500 text-white p-3 rounded-full shadow-lg hover:bg-brand-600 transition-colors"
            >
              <Play className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile bottom navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex justify-around py-2">
          <button
            onClick={() => setActiveBottomTab('elements')}
            className={cn(
              'flex flex-col items-center p-2',
              activeBottomTab === 'elements' ? 'text-brand-500' : 'text-neutral-500'
            )}
          >
            <Layers className="w-5 h-5 mb-1" />
            <span className="text-xs">元素</span>
          </button>
          <button
            onClick={() => setActiveBottomTab('console')}
            className={cn(
              'flex flex-col items-center p-2',
              activeBottomTab === 'console' ? 'text-brand-500' : 'text-neutral-500'
            )}
          >
            <Play className="w-5 h-5 mb-1" />
            <span className="text-xs">日志</span>
          </button>
          <button
            onClick={() => {
              // 打开移动端设置菜单
              alert('移动端设置功能正在开发中');
            }}
            className="flex flex-col items-center p-2 text-neutral-500"
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs">设置</span>
          </button>
        </div>
      </main>
    </div>
  );
}

function ConsolePanel() {
  const { runtime } = useStore();
  
  return (
    <div className="space-y-1 font-mono text-xs">
      {runtime.logs.length === 0 ? (
        <p className="text-neutral-400 italic">暂无日志...</p>
      ) : (
        runtime.logs.map((log, i) => (
          <div
            key={i}
            className={cn(
              'px-2 py-1 rounded',
              log.type === 'error' && 'bg-red-50 text-red-700',
              log.type === 'broadcast' && 'bg-brand-50 text-brand-700',
              log.type === 'info' && 'bg-neutral-50 text-neutral-700'
            )}
          >
            <span className="text-neutral-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
            {log.message}
          </div>
        ))
      )}
    </div>
  );
}