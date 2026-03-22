// src/components/layout/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Code2, Play, Download, Settings,
  ChevronRight, Box, Database, Zap, Eye, Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/', label: '仪表板', icon: LayoutDashboard },
  { href: '/editor', label: '编辑器', icon: Code2 },
  { href: '/preview', label: '预览', icon: Play },
  { href: '/export', label: '导出', icon: Download },
  { href: '/settings', label: '设置', icon: Settings },
];

const blockCategories = [
  { id: 'event', label: '事件', icon: Zap, color: 'text-amber-600 bg-amber-50' },
  { id: 'control', label: '控制', icon: Terminal, color: 'text-indigo-600 bg-indigo-50' },
  { id: 'action', label: '动作', icon: Box, color: 'text-blue-600 bg-blue-50' },
  { id: 'sensing', label: '侦测', icon: Eye, color: 'text-emerald-600 bg-emerald-50' },
  { id: 'data', label: '数据', icon: Database, color: 'text-orange-600 bg-orange-50' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4 border-b border-neutral-100">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">积木分类</h3>
        <div className="space-y-2">
          {blockCategories.map((cat) => (
            <div
              key={cat.id}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all',
                cat.color
              )}
            >
              <cat.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
        <div className="text-xs text-neutral-500 space-y-1">
          <div className="flex justify-between">
            <span>Ctrl+S</span>
            <span className="text-neutral-400">保存</span>
          </div>
          <div className="flex justify-between">
            <span>Ctrl+Z</span>
            <span className="text-neutral-400">撤销</span>
          </div>
        </div>
      </div>
    </aside>
  );
}