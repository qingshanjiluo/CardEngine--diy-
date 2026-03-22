// src/components/layout/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers, Play, Download, Settings, ChevronDown, ChevronRight,
  Heart, Save, FolderOpen, Plus, Clock, Menu, X, Package, FileText, Book
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { RecentProjects } from '@/components/projects/RecentProjects';
import { AssetsLibrary } from '@/components/game/AssetsLibrary';
import { CardTableExport } from '@/components/game/CardTableExport';
import { RulebookExport } from '@/components/game/RulebookExport';

const navItems = [
  { href: '/', label: '仪表板', icon: Layers },
  { href: '/editor', label: '编辑器', icon: Play },
  { href: '/preview', label: '预览', icon: Play },
  { href: '/export', label: '导出', icon: Download },
  { href: '/settings', label: '设置', icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  const {
    project,
    runtime,
    startGame,
    pauseGame,
    resetGame,
    stepExecution,
    setExecutionSpeed,
    exportProject,
    setCurrentPage
  } = useStore();
  
  const [showSponsor, setShowSponsor] = useState(false);
  const [showRecentProjects, setShowRecentProjects] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAssetsLibrary, setShowAssetsLibrary] = useState(false);
  const [showCardTableExport, setShowCardTableExport] = useState(false);
  const [showRulebookExport, setShowRulebookExport] = useState(false);

  const isPlaying = runtime.isPlaying;
  const isPaused = runtime.isPaused;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-neutral-200/80 z-50 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold tracking-tight text-neutral-900">CardEngine</h1>
              <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">卡牌创作引擎</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1 ml-8 bg-neutral-100/50 p-1 rounded-xl">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/50'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                  )}
                  onClick={() => setCurrentPage(item.label.toLowerCase() as any)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-neutral-100"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isPlaying && (
            <div className="hidden sm:flex items-center gap-3 mr-4 px-3 py-1.5 bg-brand-50 rounded-lg border border-brand-100">
              <span className="text-xs font-medium text-brand-700">
                回合 {runtime.turnCount}
              </span>
              <div className="h-3 w-px bg-brand-200" />
              <span className="text-xs font-medium text-brand-700">
                {project.players[runtime.currentPlayerIndex]?.name}
              </span>
              {isPaused && <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">暂停</span>}
            </div>
          )}
          
          <Button variant="ghost" size="icon" onClick={() => setShowSponsor(true)} className="text-neutral-500 hover:text-red-500 hidden sm:flex">
            <Heart className="w-5 h-5" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={() => setShowRecentProjects(true)} className="text-neutral-500 hover:text-brand-500 hidden sm:flex" title="最近项目">
            <Clock className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setShowAssetsLibrary(true)} className="text-neutral-500 hover:text-brand-500 hidden sm:flex" title="素材库">
            <Package className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setShowCardTableExport(true)} className="text-neutral-500 hover:text-brand-500 hidden sm:flex" title="导出卡牌表">
            <FileText className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setShowRulebookExport(true)} className="text-neutral-500 hover:text-brand-500 hidden sm:flex" title="导出规则书">
            <Book className="w-5 h-5" />
          </Button>
          
          <div className="h-6 w-px bg-neutral-200 mx-1 hidden sm:block" />
          
          {!isPlaying ? (
            <>
              <Button variant="primary" size="sm" onClick={startGame} className="hidden sm:flex">
                <Play className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">运行游戏</span>
                <span className="md:hidden">运行</span>
              </Button>
              <Button variant="outline" size="sm" onClick={stepExecution} title="单步调试" className="hidden sm:flex">
                <ChevronRight className="w-4 h-4 mr-2" />
                单步
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={pauseGame} className="hidden sm:flex">
                {isPaused ? '继续' : '暂停'}
              </Button>
              <Button variant="outline" size="sm" onClick={stepExecution} title="单步执行当前积木" className="hidden sm:flex">
                <ChevronRight className="w-4 h-4 mr-2" />
                单步
              </Button>
              <Button variant="outline" size="sm" onClick={resetGame} className="hidden sm:flex">
                重置
              </Button>
              
              {/* 速度调节 */}
              <div className="relative hidden sm:block">
                <select
                  value={runtime.speed}
                  onChange={(e) => setExecutionSpeed(e.target.value as 'slow' | 'normal' | 'fast')}
                  className="appearance-none bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent cursor-pointer"
                >
                  <option value="slow">🐢 慢速</option>
                  <option value="normal">🚶 正常</option>
                  <option value="fast">⚡ 快速</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
              </div>
            </>
          )}

          {/* Mobile play button */}
          <Button variant="primary" size="icon" onClick={startGame} className="sm:hidden">
            <Play className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Sponsor Modal */}
      <Modal isOpen={showSponsor} onClose={() => setShowSponsor(false)} title="支持 CardEngine">
        <div className="space-y-6 text-center">
          <p className="text-lg text-neutral-700">请作者喝一杯咖啡吧，谢谢＾3＾</p>
          
          <div className="flex justify-center">
            <div className="w-48 h-48 rounded-xl overflow-hidden border-4 border-white shadow-lg">
              <img 
                src="https://chat.mk49.cyou/static/files/68a2d748ad67a2438ad9e49b/9b8157ca091035857751b6c61028e9e3.jpg"
                alt="付款码"
                className="w-full h-full object-contain bg-white"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="px-3 py-1.5 bg-neutral-100 rounded-full font-mono">andyloveanny</span>
            <span className="px-3 py-1.5 bg-neutral-100 rounded-full text-xs">sifangzhiji@qq.com</span>
          </div>

          <div className="pt-4 border-t border-neutral-100">
            <p className="text-xs font-medium text-neutral-400 uppercase mb-3">友情链接</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['GitHub', 'MK48', '文叔叔', 'AirPortal', 'Kimi'].map((name) => (
                <span key={name} className="px-2 py-1 bg-neutral-50 rounded text-xs text-neutral-600">
                  {name}
                </span>
              ))}
            </div>
          </div>
          
          <p className="text-xs text-neutral-400">作者：最中幻想</p>
        </div>
      </Modal>

      {/* Recent Projects Modal */}
      <RecentProjects
        isOpen={showRecentProjects}
        onClose={() => setShowRecentProjects(false)}
        onProjectSelect={(projectId) => {
          console.log('Project selected:', projectId);
        }}
      />

      {/* Mobile Menu Modal */}
      <Modal isOpen={showMobileMenu} onClose={() => setShowMobileMenu(false)} title="导航菜单" className="md:hidden">
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700 border border-brand-100'
                    : 'text-neutral-700 hover:bg-neutral-100'
                )}
                onClick={() => {
                  setShowMobileMenu(false);
                  setCurrentPage(item.label.toLowerCase() as any);
                }}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
          
          <div className="pt-4 border-t border-neutral-200 mt-4">
            <div className="text-xs font-medium text-neutral-500 uppercase mb-2">游戏控制</div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="primary" size="sm" onClick={startGame} className="w-full">
                <Play className="w-4 h-4 mr-2" />
                运行游戏
              </Button>
              <Button variant="outline" size="sm" onClick={stepExecution} className="w-full">
                <ChevronRight className="w-4 h-4 mr-2" />
                单步
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSponsor(true)} className="w-full">
                <Heart className="w-4 h-4 mr-2" />
                赞助
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowRecentProjects(true)} className="w-full">
                <Clock className="w-4 h-4 mr-2" />
                最近项目
              </Button>
            </div>
          </div>

          {isPlaying && (
            <div className="pt-4 border-t border-neutral-200 mt-4">
              <div className="text-xs font-medium text-neutral-500 uppercase mb-2">游戏状态</div>
              <div className="bg-brand-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-brand-700">回合 {runtime.turnCount}</span>
                  <span className="text-sm font-medium text-brand-700">
                    {project.players[runtime.currentPlayerIndex]?.name}
                  </span>
                </div>
                {isPaused && (
                  <div className="mt-2 text-center">
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">游戏暂停</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Assets Library Modal */}
      <AssetsLibrary
        isOpen={showAssetsLibrary}
        onClose={() => setShowAssetsLibrary(false)}
      />

      {/* Card Table Export Modal */}
      <CardTableExport
        isOpen={showCardTableExport}
        onClose={() => setShowCardTableExport(false)}
      />

      {/* Rulebook Export Modal */}
      <RulebookExport
        isOpen={showRulebookExport}
        onClose={() => setShowRulebookExport(false)}
      />
    </>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}