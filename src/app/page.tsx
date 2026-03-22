// src/app/page.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Layers, Play, Download, Settings, 
  Plus, FileJson, Monitor, Users, Sparkles,
  ArrowRight, Heart, Code
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { useStore } from '@/lib/store';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function DashboardPage() {
  const { project, runtime } = useStore();

  const stats = [
    { label: '元素', value: project.elements.length, icon: Layers, color: 'text-blue-500 bg-blue-50' },
    { label: '玩家', value: project.players.length, icon: Users, color: 'text-emerald-500 bg-emerald-50' },
    { label: '全局积木', value: project.globalScript.length, icon: FileJson, color: 'text-amber-500 bg-amber-50' },
    { label: '变量', value: Object.keys(project.variables).length, icon: Settings, color: 'text-purple-500 bg-purple-50' },
  ];

  const quickActions = [
    { label: '开始编辑', icon: Play, href: '/editor', variant: 'primary' as const },
    { label: '导出项目', icon: Download, href: '#', variant: 'secondary' as const },
    { label: '游戏设置', icon: Settings, href: '/srtting', variant: 'secondary' as const },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-neutral-200/80 z-50 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#5686FE] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="font-semibold text-neutral-900">CardEngine</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/editor" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">编辑器</Link>
          <Link href="/info" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">关于</Link>
          <Link href="/info">
            <Button variant="primary" size="sm" className="gap-2">
              <Heart className="w-4 h-4" />
              支持我们
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Welcome Card */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5686FE] to-[#4475ed] p-8 text-white shadow-xl shadow-blue-500/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span>可视化卡牌游戏引擎</span>
                  </div>
                  <h1 className="text-4xl font-bold mb-4">{project.name}</h1>
                  <p className="text-white/80 mb-6 max-w-md">
                    使用积木式编程创建你的卡牌游戏。无需编写代码，拖拽积木即可实现游戏逻辑。
                  </p>
                  <div className="flex items-center gap-3">
                    <Link href="/editor">
                      <Button variant="secondary" size="lg" className="gap-2 bg-white text-[#5686FE] hover:bg-white/90">
                        <Play className="w-5 h-5" />
                        开始创作
                      </Button>
                    </Link>
                    <Link href="/info">
                      <Button variant="outline" size="lg" className="gap-2 border-white/30 text-white hover:bg-white/10">
                        了解更多
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">快速操作</h2>
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 cursor-pointer mb-3 ${
                      action.variant === 'primary' 
                        ? 'bg-[#5686FE] text-white border-[#5686FE] shadow-lg shadow-blue-500/20' 
                        : 'bg-white border-neutral-200 hover:border-[#5686FE]/30 hover:shadow-lg'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      action.variant === 'primary' ? 'bg-white/20' : 'bg-neutral-100'
                    }`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{action.label}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 opacity-50" />
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={itemVariants}>
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-neutral-500">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">功能特性</h2>
            <p className="text-neutral-500 max-w-2xl mx-auto">
              CardEngine 提供了完整的可视化游戏开发环境，让你专注于游戏创意而非代码实现
            </p>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { 
                icon: Layers, 
                title: '积木式编程', 
                desc: '100+ 种积木块，覆盖事件、控制、动作、侦测等全部功能' 
              },
              { 
                icon: Monitor, 
                title: '实时预览', 
                desc: '边编辑边预览，即时查看游戏运行效果' 
              },
              { 
                icon: Code, 
                title: '一键导出', 
                desc: '支持导出为 JSON、HTML 等多种格式，方便分享和部署' 
              },
            ].map((feature) => (
              <motion.div 
                key={feature.title}
                variants={itemVariants}
                className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100 hover:border-[#5686FE]/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-[#5686FE]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#5686FE] transition-colors">
                  <feature.icon className="w-7 h-7 text-[#5686FE] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-neutral-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-neutral-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#5686FE] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-medium text-neutral-900">CardEngine</span>
          </div>
          <p className="text-sm text-neutral-400">
            © 2026 CardEngine. 开源免费，永久使用。
          </p>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <Link href="/editor" className="hover:text-neutral-900 transition-colors">编辑器</Link>
            <Link href="/info" className="hover:text-neutral-900 transition-colors">关于</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
