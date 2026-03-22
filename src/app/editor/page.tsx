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
import { MobileDrawer } from '@/components/ui/MobileDrawer';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Layers, Play, Code2, Settings, Grid3x3 } from 'lucide-react';

export default function EditorPage() {
  const { currentPage } = useStore();
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [activeBottomTab, setActiveBottomTab] = useState<'elements' | 'console'>('elements');
  const [activeRightTab, setActiveRightTab] = useState<'preview' | 'debug'>('preview');
  const [showMobileBlockPalette, setShowMobileBlockPalette] = useState(false);
  const [showMobileGamePreview, setShowMobileGamePreview] = useState(false);
  const [showMobileSettings, setShowMobileSettings] = useState(false);

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
              onClick={() => setShowMobileBlockPalette(true)}
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
              onClick={() => setShowMobileGamePreview(true)}
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
            onClick={() => setShowMobileSettings(true)}
            className={cn(
              'flex flex-col items-center p-2',
              showMobileSettings ? 'text-brand-500' : 'text-neutral-500'
            )}
          >
            <Settings className="w-5 h-5 mb-1" />
            <span className="text-xs">设置</span>
          </button>
        </div>
      </main>

      {/* Mobile Drawers */}
      <MobileDrawer
        isOpen={showMobileBlockPalette}
        onClose={() => setShowMobileBlockPalette(false)}
        title="积木库"
        position="left"
      >
        <MobileBlockPaletteDrawer />
      </MobileDrawer>

      <MobileDrawer
        isOpen={showMobileGamePreview}
        onClose={() => setShowMobileGamePreview(false)}
        title="游戏预览"
        position="right"
      >
        <MobileGamePreviewDrawer />
      </MobileDrawer>

      <MobileDrawer
        isOpen={showMobileSettings}
        onClose={() => setShowMobileSettings(false)}
        title="设置"
        position="bottom"
      >
        <MobileSettingsDrawer />
      </MobileDrawer>
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

// Mobile Drawers
function MobileBlockPaletteDrawer() {
  return (
    <div className="p-4">
      <h4 className="font-semibold text-lg mb-4">积木库</h4>
      <p className="text-sm text-neutral-600 mb-4">
        在移动端选择积木进行编辑。点击积木可添加到画布。
      </p>
      <div className="grid grid-cols-2 gap-3">
        {['事件', '控制', '动作', '侦测', '运算', '变量'].map((category) => (
          <button
            key={category}
            className="p-4 bg-neutral-100 rounded-xl text-center hover:bg-neutral-200 transition-colors"
          >
            <div className="font-medium">{category}</div>
            <div className="text-xs text-neutral-500 mt-1">点击查看</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MobileGamePreviewDrawer() {
  const { project } = useStore();
  
  return (
    <div className="p-4">
      <h4 className="font-semibold text-lg mb-4">游戏预览</h4>
      <div className="aspect-video bg-neutral-100 rounded-xl mb-4 flex items-center justify-center">
        <div className="text-center">
          <Play className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm text-neutral-500">游戏预览区域</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">游戏状态</span>
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded">准备中</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">当前玩家</span>
          <span className="font-medium">{project.players[0]?.name || '未设置'}</span>
        </div>
      </div>
    </div>
  );
}

function MobileSettingsDrawer() {
  const { project, updateProjectSettings } = useStore();
  
  return (
    <div className="p-4">
      <h4 className="font-semibold text-lg mb-4">设置</h4>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">项目名称</label>
          <input
            type="text"
            defaultValue={project.name}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
            placeholder="输入项目名称"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">游戏描述</label>
          <textarea
            defaultValue={project.description}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg h-24"
            placeholder="描述你的游戏"
          />
        </div>
        <button className="w-full py-3 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors">
          保存设置
        </button>
      </div>
    </div>
  );
}