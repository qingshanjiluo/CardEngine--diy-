// src/components/projects/RecentProjects.tsx

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Trash2, Clock, FolderOpen, Plus } from 'lucide-react';

interface RecentProjectsProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSelect?: (projectId: string) => void;
}

export function RecentProjects({ isOpen, onClose, onProjectSelect }: RecentProjectsProps) {
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  const loadProject = useStore((state) => state.loadProject);
  const deleteProject = useStore((state) => state.deleteProject);
  const saveProject = useStore((state) => state.saveProject);
  const setCurrentPage = useStore((state) => state.setCurrentPage);
  
  const refreshProjects = () => {
    try {
      const projects = useStore.getState().getRecentProjects();
      setRecentProjects(projects);
    } catch (error) {
      console.error('加载最近项目失败:', error);
      setRecentProjects([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      refreshProjects();
    }
  }, [isOpen]);
  
  const handleOpenProject = (projectId: string) => {
    loadProject(projectId);
    setCurrentPage('editor');
    onClose();
    if (onProjectSelect) {
      onProjectSelect(projectId);
    }
  };
  
  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId);
    refreshProjects();
    setConfirmDeleteId(null);
  };
  
  const handleCreateNew = () => {
    // 保存当前项目为新项目
    saveProject('新项目');
    refreshProjects();
    // 重新加载项目列表并打开最新项目
    const projects = useStore.getState().getRecentProjects();
    if (projects.length > 0) {
      const latestProject = projects[0]; // 最新的项目在第一个
      handleOpenProject(latestProject.id);
    }
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title="最近项目" 
        className="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-neutral-600">
              最近编辑的项目会自动保存到本地。最多保留10个项目。
            </p>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleCreateNew}
              className="gap-2"
            >
              <Plus size={16} />
              新建项目
            </Button>
          </div>
          
          {loading ? (
            <div className="py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5686FE]"></div>
              <p className="mt-2 text-neutral-500">加载中...</p>
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-neutral-200 rounded-xl">
              <FolderOpen className="mx-auto h-12 w-12 text-neutral-300" />
              <h3 className="mt-4 text-lg font-medium text-neutral-700">暂无项目</h3>
              <p className="mt-2 text-sm text-neutral-500">
                开始创建你的第一个桌游项目吧！
              </p>
              <Button 
                variant="primary" 
                className="mt-4"
                onClick={handleCreateNew}
              >
                创建新项目
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
              {recentProjects.map((project) => (
                <Card key={project.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FolderOpen size={18} className="text-[#5686FE]" />
                        <h3 className="font-medium text-neutral-800 truncate">
                          {project.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-neutral-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{formatDate(project.lastModified)}</span>
                        </div>
                        <div className="text-xs bg-neutral-100 px-2 py-1 rounded">
                          {project.project.elements?.length || 0} 个元素
                        </div>
                      </div>
                      
                      <div className="text-sm text-neutral-600 line-clamp-2">
                        玩家: {project.project.settings?.playersCount || 2}人 · 
                        网格: {project.project.settings?.gridRows || 3}×{project.project.settings?.gridCols || 5}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenProject(project.id)}
                        className="gap-1"
                      >
                        <FolderOpen size={14} />
                        打开
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDeleteId(project.id)}
                        className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        删除
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          <div className="pt-4 border-t border-neutral-200 text-sm text-neutral-500">
            <p>项目数据保存在浏览器本地存储中，清除浏览器数据会丢失项目。</p>
            <p className="mt-1">建议定期使用"导出项目"功能备份重要项目。</p>
          </div>
        </div>
      </Modal>
      
      {/* 删除确认对话框 */}
      <Modal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title="确认删除"
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            确定要删除这个项目吗？此操作不可恢复。
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteId(null)}
            >
              取消
            </Button>
            <Button
              variant="danger"
              onClick={() => confirmDeleteId && handleDeleteProject(confirmDeleteId)}
            >
              删除
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}