// src/app/info/page.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Heart, Github, Mail, ExternalLink, 
  Sparkles, Users, Code, Coffee 
} from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
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

const sponsorLinks = [
  { name: 'GitHub', url: 'https://github.com/sponsors', icon: Github, color: 'hover:bg-neutral-800 hover:text-white' },
  { name: 'MK48', url: '#', icon: Sparkles, color: 'hover:bg-amber-500 hover:text-white' },
  { name: '文叔叔', url: '#', icon: Mail, color: 'hover:bg-blue-500 hover:text-white' },
  { name: 'AirPortal', url: '#', icon: ExternalLink, color: 'hover:bg-cyan-500 hover:text-white' },
  { name: 'Kimi', url: '#', icon: Sparkles, color: 'hover:bg-purple-500 hover:text-white' },
];

const features = [
  { icon: Code, title: '可视化编程', desc: '像搭积木一样创建游戏逻辑，无需编写代码' },
  { icon: Sparkles, title: '现代设计', desc: '采用现代主义美学，简洁优雅的界面体验' },
  { icon: Users, title: '无限可能', desc: '支持创建各种类型的卡牌游戏' },
  { icon: Coffee, title: '开源免费', desc: '完全开源，免费使用，社区驱动发展' },
];

export default function InfoPage() {
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
        <div className="flex items-center gap-3">
          <Link href="/editor">
            <Button variant="primary" size="sm">开始创作</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>可视化卡牌游戏引擎</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 tracking-tight">
              让创意成为<br />
              <span className="text-[#5686FE]">可玩的游戏</span>
            </h1>
            <p className="text-xl text-neutral-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              CardEngine 是一个开源的可视化卡牌游戏创作引擎，
              让你无需编写代码就能创建精彩的卡牌游戏。
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/editor">
                <Button variant="primary" size="lg" className="gap-2">
                  <Sparkles className="w-5 h-5" />
                  立即开始
                </Button>
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="lg" className="gap-2">
                  <Github className="w-5 h-5" />
                  GitHub
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100 hover:border-[#5686FE]/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-[#5686FE]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#5686FE] group-hover:text-white transition-colors">
                  <feature.icon className="w-6 h-6 text-[#5686FE] group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sponsor Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-neutral-50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/20">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">支持 CardEngine</h2>
            <p className="text-neutral-500 mb-10 leading-relaxed">
              CardEngine 是免费开源项目，你的支持将帮助我们持续改进产品，
              开发更多功能，让游戏创作变得更加简单有趣。
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {sponsorLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border border-neutral-200 bg-white',
                    'hover:border-transparent hover:shadow-lg transition-all duration-300',
                    link.color
                  )}
                >
                  <link.icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{link.name}</span>
                </a>
              ))}
            </div>
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
            © 2026 CardEngine. 开源项目，免费使用。
          </p>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <Link href="/" className="hover:text-neutral-900 transition-colors">首页</Link>
            <Link href="/editor" className="hover:text-neutral-900 transition-colors">编辑器</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
