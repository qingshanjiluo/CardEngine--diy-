// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Layers, Play, Download, Settings,
  Plus, FileJson, Monitor, Users, Sparkles,
  ArrowRight, Heart, Code, Check, Copy
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';

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
  const { project, runtime, exportProject, importProject } = useStore();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'html'>('json');
  const [exportedData, setExportedData] = useState<string>('');
  const [importData, setImportData] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string>('');

  const stats = [
    { label: '元素', value: project.elements.length, icon: Layers, color: 'text-blue-500 bg-blue-50' },
    { label: '玩家', value: project.players.length, icon: Users, color: 'text-emerald-500 bg-emerald-50' },
    { label: '全局积木', value: project.globalScript.length, icon: FileJson, color: 'text-amber-500 bg-amber-50' },
    { label: '变量', value: Object.keys(project.variables).length, icon: Settings, color: 'text-purple-500 bg-purple-50' },
  ];

  const quickActions = [
    { label: '开始编辑', icon: Play, href: '/editor', variant: 'primary' as const },
    {
      label: '导出项目',
      icon: Download,
      onClick: () => handleExportClick(),
      variant: 'secondary' as const
    },
    {
      label: '导入项目',
      icon: Plus,
      onClick: () => setShowImportModal(true),
      variant: 'secondary' as const
    },
    { label: '游戏设置', icon: Settings, href: '/srtting', variant: 'secondary' as const },
  ];

  const handleExportClick = () => {
    setShowExportModal(true);
    const data = exportProject('json');
    setExportedData(data);
  };

  const handleExport = (format: 'json' | 'html') => {
    const data = exportProject(format);
    setExportedData(data);
    setExportFormat(format);
    
    if (format === 'json') {
      // 对于JSON，显示在文本区域
      return;
    } else if (format === 'html') {
      // 对于HTML，创建下载
      const blob = new Blob([data], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name || 'cardengine-project'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportedData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([exportedData], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name || 'cardengine-project'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      setImportError('');
      importProject(importData);
      setShowImportModal(false);
      setImportData('');
    } catch (error) {
      setImportError(error instanceof Error ? error.message : '导入失败，请检查JSON格式');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

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
              {quickActions.map((action) => {
                const content = (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.onClick}
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
                );

                return action.href ? (
                  <Link key={action.label} href={action.href}>
                    {content}
                  </Link>
                ) : (
                  <div key={action.label}>
                    {content}
                  </div>
                );
              })}
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

      {/* Import Modal */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="导入项目">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-neutral-600 mb-4">
              粘贴项目JSON数据或上传JSON文件来导入项目。
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                上传JSON文件
              </label>
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-brand-400 transition-colors">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="import-file"
                />
                <label
                  htmlFor="import-file"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mb-3">
                    <Download className="w-6 h-6 text-brand-600" />
                  </div>
                  <span className="text-sm font-medium text-neutral-700">点击选择文件</span>
                  <span className="text-xs text-neutral-500 mt-1">或拖放JSON文件到这里</span>
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                或直接粘贴JSON数据
              </label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="w-full h-64 font-mono text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-lg resize-none"
                placeholder='{"name": "我的项目", "version": "1.0.0", ...}'
                spellCheck="false"
              />
            </div>
            
            {importError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{importError}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
            <Button variant="outline" onClick={() => setShowImportModal(false)}>
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={!importData.trim()}
            >
              导入项目
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="导出项目">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-neutral-600 mb-4">
              选择导出格式，将您的项目保存为文件或复制到剪贴板。
            </p>
            
            <div className="flex gap-3 mb-6">
              <Button
                variant={exportFormat === 'json' ? 'primary' : 'outline'}
                onClick={() => handleExport('json')}
                className="flex-1"
              >
                JSON 格式
              </Button>
              <Button
                variant={exportFormat === 'html' ? 'primary' : 'outline'}
                onClick={() => handleExport('html')}
                className="flex-1"
              >
                HTML 格式
              </Button>
            </div>
            
            {exportedData && exportFormat === 'json' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-700">项目数据 (JSON)</label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyToClipboard}
                      className="gap-1"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? '已复制' : '复制'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadJson}
                      className="gap-1"
                    >
                      <Download className="w-4 h-4" />
                      下载
                    </Button>
                  </div>
                </div>
                <textarea
                  readOnly
                  value={exportedData}
                  className="w-full h-64 font-mono text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-lg resize-none"
                  spellCheck="false"
                />
                <p className="text-xs text-neutral-500">
                  提示：JSON 格式包含完整的项目数据，可用于备份或导入到其他 CardEngine 实例。
                </p>
              </div>
            )}
            
            {exportFormat === 'html' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Download className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-emerald-800 mb-1">HTML 文件已下载</h4>
                    <p className="text-sm text-emerald-700">
                      您的项目已导出为独立的 HTML 文件，可以在任何浏览器中打开运行。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              关闭
            </Button>
          </div>
        </div>
      </Modal>

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
