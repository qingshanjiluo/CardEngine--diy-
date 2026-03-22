// src/components/blocks/BlockCanvas.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { CodeBlock } from './CodeBlock';
import { Button } from '@/components/ui/Button';
import { Plus, Upload, Download, Trash2 } from 'lucide-react';
import { ImportDialog } from './ImportDialog';
import { ExportDialog } from './ExportDialog';
import { cn } from '@/lib/utils';

export function BlockCanvas() {
  const {
    project,
    selectedElement,
    activeScriptTab,
    setActiveScriptTab,
    selectedBlock,
    setSelectedBlock,
    addBlock,
    addChildBlock,
    moveBlock,
    deleteBlock
  } = useStore();

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);
  const [isDragOverDelete, setIsDragOverDelete] = useState(false);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  const currentScript = activeScriptTab === 'global' 
    ? project.globalScript 
    : project.elements.find(el => el.id === selectedElement)?.script || [];

  // 处理从积木库拖拽添加
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOverCanvas) {
      setIsDragOverCanvas(true);
    }
  }, [isDragOverCanvas]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // 检查是否真的离开了canvas区域
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOverCanvas(false);
      setDragOverIndex(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, insertIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverCanvas(false);
    setDragOverIndex(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (data.type === 'new-block') {
        // 从积木库拖拽新积木
        const newBlock = {
          type: data.blockType,
          category: data.category,
          label: data.label,
          inputs: data.inputs,
        };
        
        // 根据当前激活的标签页决定添加到全局脚本还是元素脚本
        const target = activeScriptTab;
        addBlock(newBlock, target);
      } else if (data.type === 'move-block' && data.index !== undefined && insertIndex !== undefined) {
        // 重新排序
        if (data.index !== insertIndex && data.index !== insertIndex - 1) {
          const targetIndex = data.index < insertIndex ? insertIndex - 1 : insertIndex;
          moveBlock(data.index, targetIndex);
        }
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
    setDraggedBlockId(null);
  }, [addBlock, moveBlock, activeScriptTab]);

  // 处理积木项的拖拽事件
  const handleBlockDragStart = useCallback((index: number, blockId: string) => {
    setDraggedBlockId(blockId);
  }, []);

  const handleBlockDragEnd = useCallback(() => {
    setDraggedBlockId(null);
    setDragOverIndex(null);
  }, []);

  const handleBlockDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'move-block' && data.blockId !== currentScript[index]?.id) {
        setDragOverIndex(index);
      }
    } catch {
      // 可能是新积木，也可以插入
      setDragOverIndex(index);
    }
  }, [currentScript]);

  // 删除区域处理
  const handleDeleteDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOverDelete(true);
  }, []);

  const handleDeleteDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverDelete(false);
  }, []);

  const handleDeleteDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverDelete(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'move-block' && data.blockId) {
        deleteBlock(data.blockId);
      }
    } catch (err) {
      console.error('Delete drop error:', err);
    }
    setDraggedBlockId(null);
  }, [deleteBlock]);

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-50/50 relative overflow-hidden">
      {/* Tabs */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-1 flex items-center gap-1">
          <button
            onClick={() => setActiveScriptTab('global')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              activeScriptTab === 'global' 
                ? 'bg-neutral-900 text-white' 
                : 'text-neutral-600 hover:bg-neutral-100'
            )}
          >
            全局脚本
          </button>
          <button
            onClick={() => setActiveScriptTab('element')}
            disabled={!selectedElement}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              activeScriptTab === 'element' 
                ? 'bg-brand-500 text-white' 
                : 'text-neutral-600 hover:bg-neutral-100 disabled:opacity-40'
            )}
          >
            {selectedElement 
              ? project.elements.find(e => e.id === selectedElement)?.name || '元素脚本'
              : '选择元素'
            }
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsImportOpen(true)}
            title="导入项目"
          >
            <Upload className="w-4 h-4 mr-1" />
            导入
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsExportOpen(true)}
            title="导出项目"
          >
            <Download className="w-4 h-4 mr-1" />
            导出
          </Button>
          <div className="w-px h-6 bg-neutral-200 mx-1" />
          <Button variant="secondary" size="sm" onClick={() => {
            addBlock({
              type: 'event_game_start',
              category: 'event',
              label: '当游戏开始时',
              inputs: {},
            }, activeScriptTab);
          }}>
            <Plus className="w-4 h-4 mr-1" />
            添加积木
          </Button>
        </div>
      </div>

      {/* Delete Zone - 只在拖拽时显示 */}
      <AnimatePresence>
        {draggedBlockId && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onDragOver={handleDeleteDragOver}
            onDragLeave={handleDeleteDragLeave}
            onDrop={handleDeleteDrop}
            className={cn(
              'absolute top-20 left-1/2 -translate-x-1/2 z-20',
              'px-6 py-3 rounded-full flex items-center gap-2',
              'transition-all duration-200',
              isDragOverDelete 
                ? 'bg-red-500 text-white shadow-lg scale-110' 
                : 'bg-white text-red-500 border-2 border-red-200 shadow-md'
            )}
          >
            <Trash2 className="w-5 h-5" />
            <span className="font-medium">拖拽到此处删除</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <div 
        className={cn(
          'flex-1 overflow-auto cursor-grab active:cursor-grabbing pt-20 pb-10 transition-all duration-200',
          isDragOverCanvas && 'bg-blue-50/30'
        )}
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #e5e5e5 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, currentScript.length)}
      >
        <div className="min-w-[800px] min-h-[600px] p-10">
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {currentScript.map((block, index) => (
                <React.Fragment key={block.id}>
                  {/* 插入位置指示器 */}
                  {dragOverIndex === index && draggedBlockId !== block.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, index)}
                      className="h-2 bg-blue-400 rounded-full mx-4 my-1 shadow-sm"
                    />
                  )}
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onDragOver={(e) => handleBlockDragOver(e, index)}
                  >
                    <CodeBlock
                      block={block}
                      isSelected={selectedBlock === block.id}
                      onClick={() => setSelectedBlock(block.id)}
                      index={index}
                      onDragStart={() => handleBlockDragStart(index, block.id)}
                      onDragEnd={handleBlockDragEnd}
                      onAddChild={(parentId) => {
                        // 当用户拖拽积木到子区域时，添加子积木
                        // 这里需要从拖拽数据中获取积木信息
                        // 暂时使用一个默认积木
                        addChildBlock(parentId, {
                          type: 'action_move',
                          category: 'action',
                          label: '移动 [元素] 到 [空白位]',
                          inputs: {
                            element: { type: 'element', value: '' },
                            slot: { type: 'dropdown', value: 0 }
                          }
                        });
                      }}
                    />
                  </motion.div>
                </React.Fragment>
              ))}
            </AnimatePresence>
            
            {/* 末尾插入位置指示器 */}
            {dragOverIndex === currentScript.length && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="h-2 bg-blue-400 rounded-full mx-4 my-1 shadow-sm"
              />
            )}
            
            {currentScript.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "flex flex-col items-center justify-center h-64 text-neutral-400 rounded-xl border-2 border-dashed transition-all duration-200",
                  isDragOverCanvas ? "border-blue-400 bg-blue-50/50" : "border-neutral-200"
                )}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 0)}
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                  isDragOverCanvas ? "bg-blue-100" : "bg-neutral-100"
                )}>
                  <Plus className={cn("w-8 h-8", isDragOverCanvas ? "text-blue-500" : "")} />
                </div>
                <p className="text-sm font-medium">
                  {isDragOverCanvas ? "释放以添加积木" : "拖拽积木到此处"}
                </p>
                <p className="text-xs mt-1 opacity-70">或点击"添加积木"按钮</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* 导入导出对话框 */}
      <ImportDialog isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      <ExportDialog isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
}
