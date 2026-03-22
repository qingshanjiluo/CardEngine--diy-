// src/components/blocks/CodeBlock.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { getBlockDefinition } from '@/lib/block-definitions';
import { Block } from '@/types';
import { useExecutionState, useStore } from '@/lib/store';
import { Trash2, GripVertical, Plus, Copy, Edit2, Play, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContextMenu, useLongPress, ContextMenuItem } from '@/components/ui';

interface CodeBlockProps {
  block: Block;
  isSelected?: boolean;
  isExecuting?: boolean;
  onClick?: () => void;
  index?: number;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  depth?: number;  // 嵌套深度
  onAddChild?: (parentId: string) => void;  // 添加子积木回调
}

export function CodeBlock({ 
  block, 
  isSelected, 
  isExecuting: propIsExecuting, 
  onClick,
  index,
  onDragStart,
  onDragEnd,
  depth = 0,
  onAddChild
}: CodeBlockProps) {
  const definition = getBlockDefinition(block.type);
  const { executingBlockIds, currentBlockId } = useExecutionState();
  const { deleteBlock, updateBlock } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDragOverChild, setIsDragOverChild] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
  }>({ show: false, x: 0, y: 0 });
  
  // Determine if this block is currently executing
  const isExecuting = propIsExecuting ?? (
    executingBlockIds.has(block.id) || currentBlockId === block.id
  );
  
  const canContainChildren = definition?.canContainChildren || false;

  // 右键菜单处理
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu({ show: false, x: 0, y: 0 });
  }, []);

  // 长按处理
  const longPressHandlers = useLongPress(
    () => {
      // 长按触发右键菜单
      setContextMenu({
        show: true,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    },
    onClick,
    { delay: 800 }
  );

  // 右键菜单项
  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'execute',
      label: '执行此积木',
      icon: <Play className="w-4 h-4" />,
      onClick: () => {
        // TODO: 实现执行单个积木的功能
        console.log('执行积木:', block.id);
      },
    },
    {
      id: 'edit',
      label: '编辑参数',
      icon: <Edit2 className="w-4 h-4" />,
      onClick: () => {
        // TODO: 实现编辑积木参数的功能
        console.log('编辑积木:', block.id);
      },
    },
    {
      id: 'duplicate',
      label: '复制',
      icon: <Copy className="w-4 h-4" />,
      onClick: () => {
        // TODO: 实现复制积木的功能
        console.log('复制积木:', block.id);
      },
    },
    {
      id: 'add-child',
      label: '添加子积木',
      icon: <Plus className="w-4 h-4" />,
      disabled: !canContainChildren,
      onClick: () => {
        if (onAddChild) {
          onAddChild(block.id);
        }
      },
    },
    { id: 'divider1', divider: true },
    {
      id: 'delete',
      label: '删除',
      icon: <Trash2 className="w-4 h-4" />,
      danger: true,
      onClick: () => {
        deleteBlock(block.id);
      },
    },
  ];
  
  const categoryColors: Record<string, string> = {
    event: 'border-yellow-400 bg-yellow-50',
    control: 'border-purple-400 bg-purple-50',
    action: 'border-blue-400 bg-blue-50',
    sensing: 'border-green-400 bg-green-50',
    data: 'border-orange-400 bg-orange-50',
    operators: 'border-cyan-400 bg-cyan-50',
    math: 'border-pink-400 bg-pink-50',
    text: 'border-indigo-400 bg-indigo-50',
    custom: 'border-gray-400 bg-gray-50',
  };

  const executingStyle = isExecuting 
    ? 'ring-2 ring-offset-2 ring-green-500 animate-pulse shadow-lg shadow-green-200' 
    : '';

  const selectedStyle = isSelected 
    ? 'ring-2 ring-offset-2 ring-blue-500' 
    : '';

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    onDragStart?.();
    
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'move-block',
      blockId: block.id,
      index: index,
    }));
    e.dataTransfer.effectAllowed = 'move';
    
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.opacity = '0.8';
    dragImage.style.transform = 'rotate(3deg)';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  // 子积木区域拖拽处理
  const handleChildDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canContainChildren) {
      setIsDragOverChild(true);
    }
  };

  const handleChildDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverChild(false);
  };

  const handleChildDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverChild(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'new-block' && onAddChild) {
        // 添加新积木作为子积木
        onAddChild(block.id);
      }
    } catch (err) {
      console.error('Child drop error:', err);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteBlock(block.id);
  };

  const handleInputChange = (key: string, value: any) => {
    updateBlock(block.id, { inputs: { ...block.inputs, [key]: { ...block.inputs[key], value } } });
  };

  const renderInput = (key: string, input: Block['inputs'][string]) => {
    const def = definition?.inputs?.[key];
    if (!def) return null;

    switch (def.type) {
      case 'number':
        return (
          <input
            type="number"
            value={input.value as number}
            onChange={(e) => handleInputChange(key, parseFloat(e.target.value) || 0)}
            className="w-16 px-2 py-1 text-sm border rounded bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={(e) => e.stopPropagation()}
          />
        );
      case 'text':
        return (
          <input
            type="text"
            value={input.value as string}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className="w-24 px-2 py-1 text-sm border rounded bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={(e) => e.stopPropagation()}
          />
        );
      case 'select':
        return (
          <select
            value={input.value as string}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className="px-2 py-1 text-sm border rounded bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={(e) => e.stopPropagation()}
          >
            {(def.options as string[] | undefined)?.map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case 'slot':
        return (
          <select
            value={input.value as string}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className="px-2 py-1 text-sm border rounded bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">选择格子</option>
            {Array.from({ length: 15 }, (_, i) => (
              <option key={i} value={i}>格子 {i + 1}</option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  const renderLabel = () => {
    if (!definition) return block.type;
    
    const parts = definition.label.split(/(%\d+)/g);
    let inputIndex = 0;
    const inputKeys = Object.keys(block.inputs);
    
    return (
      <>
        {parts.map((part: string, idx: number) => {
          const match = part.match(/%(\d+)/);
          if (match) {
            const key = inputKeys[inputIndex++] || `input${idx}`;
            const input = block.inputs[key];
            if (input) {
              return (
                <span key={idx} className="mx-1">
                  {renderInput(key, input)}
                </span>
              );
            }
            return <span key={idx} className="mx-1 px-2 py-1 bg-white/50 rounded text-xs">?</span>;
          }
          return <span key={idx}>{part}</span>;
        })}
      </>
    );
  };

  return (
    <div className={cn('relative', depth > 0 && 'ml-6')}>
      {/* 主积木块 */}
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={onClick}
        onContextMenu={handleContextMenu}
        {...longPressHandlers}
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
        style={{
          opacity: isDragging ? 0.5 : 1,
          transform: isDragging ? 'rotate(2deg)' : 'none',
        }}
        className={cn(
          'relative px-4 py-3 rounded-lg border-2 cursor-grab active:cursor-grabbing',
          'transition-all duration-200 group',
          categoryColors[definition?.category || 'custom'],
          executingStyle,
          selectedStyle,
          isExecuting ? 'z-10' : 'z-0',
          'hover:scale-[1.01] hover:shadow-md'
        )}
      >
        {/* 左侧拖拽手柄 */}
        <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity cursor-grab">
          <GripVertical className="w-4 h-4 text-gray-500" />
        </div>
        
        {/* 执行指示器 */}
        {isExecuting && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full shadow-sm animate-pulse" />
        )}
        
        {/* 删除按钮 */}
        {showDelete && !isExecuting && (
          <button
            onClick={handleDelete}
            className="absolute -right-2 -top-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-20"
            title="删除积木"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
        
        {/* 积木内容 */}
        <div className="flex items-center gap-2 pl-3">
          <span className="font-medium text-gray-800 whitespace-nowrap">
            {renderLabel()}
          </span>
        </div>
      </div>

      {/* 子积木容器 */}
      {canContainChildren && (
        <div
          onDragOver={handleChildDragOver}
          onDragLeave={handleChildDragLeave}
          onDrop={handleChildDrop}
          className={cn(
            'min-h-[40px] mt-1 mb-2 rounded-lg border-2 border-dashed transition-all',
            'bg-white/30',
            isDragOverChild 
              ? 'border-purple-400 bg-purple-50' 
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          {block.children && block.children.length > 0 ? (
            <div className="p-2 space-y-2">
              {block.children.map((childBlock, childIndex) => (
                <CodeBlock
                  key={childBlock.id}
                  block={childBlock}
                  index={childIndex}
                  depth={depth + 1}
                  onAddChild={onAddChild}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-10 text-xs text-gray-400">
              <Plus className="w-3 h-3 mr-1" />
              拖拽积木到此处
            </div>
          )}
        </div>
      )}

      {/* 右键菜单 */}
      {contextMenu.show && (
        <ContextMenu
          items={contextMenuItems}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}

// Hook to check if a block is currently executing
export function useBlockExecution(blockId: string): boolean {
  const { executingBlockIds, currentBlockId } = useExecutionState();
  return executingBlockIds.has(blockId) || currentBlockId === blockId;
}
