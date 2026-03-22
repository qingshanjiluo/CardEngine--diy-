// src/app/settings/page.tsx
'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { BackgroundSettings } from '@/components/game/BackgroundSettings';
import { useStore } from '@/lib/store';
import { useState } from 'react';

export default function SettingsPage() {
  const { project, updateProjectSettings, setProject } = useStore();
  const [projectName, setProjectName] = useState(project.name);
  const [author, setAuthor] = useState(project.author);

  const handleSave = () => {
    // 更新项目基本信息
    setProject({
      ...project,
      name: projectName,
      author: author,
    });
    // 这里可以添加保存成功的提示
    alert('设置已保存');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">项目设置</h1>
              <p className="text-neutral-500">配置游戏的基本参数和外观</p>
            </div>

            <Card className="p-6 space-y-6">
              <h3 className="font-semibold text-neutral-900">基本信息</h3>
              
              <Input
                label="项目名称"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              
              <Input
                label="作者"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />

              <div>
                <label className="text-xs font-medium text-neutral-600 mb-1.5 block">版本</label>
                <input
                  type="text"
                  value={project.version}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-neutral-50"
                  disabled
                />
              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <h3 className="font-semibold text-neutral-900">游戏设置</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-600 mb-1.5 block">玩家数量</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm"
                    value={project.settings.playersCount}
                    onChange={(e) => updateProjectSettings({ playersCount: parseInt(e.target.value) })}
                  >
                    <option value={2}>2 人</option>
                    <option value={3}>3 人</option>
                    <option value={4}>4 人</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-neutral-600 mb-1.5 block">网格大小</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm"
                    value={`${project.settings.gridRows}x${project.settings.gridCols}`}
                    onChange={(e) => {
                      const [rows, cols] = e.target.value.split('x').map(Number);
                      updateProjectSettings({ gridRows: rows, gridCols: cols });
                    }}
                  >
                    <option value="2x5">2 × 5</option>
                    <option value="3x5">3 × 5</option>
                    <option value="4x5">4 × 5</option>
                    <option value="5x5">5 × 5</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-600 mb-1.5 block">公共区域</label>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="publicAreaEnabled"
                    checked={project.settings.publicAreaEnabled}
                    onChange={(e) => updateProjectSettings({ publicAreaEnabled: e.target.checked })}
                    className="w-4 h-4 text-brand-500 rounded border-neutral-300 focus:ring-brand-500"
                  />
                  <label htmlFor="publicAreaEnabled" className="text-sm text-neutral-700">
                    启用公共区域（牌堆、弃牌堆、打出的牌区）
                  </label>
                </div>
              </div>
            </Card>

            {/* 背景设置面板 */}
            <BackgroundSettings />

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => {
                setProjectName(project.name);
                setAuthor(project.author);
              }}>
                重置
              </Button>
              <Button onClick={handleSave} variant="primary">
                保存设置
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}