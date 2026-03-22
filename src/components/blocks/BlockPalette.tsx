// src/components/blocks/BlockPalette.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Terminal, Box, Eye, Database, FunctionSquare, ChevronDown, Search
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { BLOCK_DEFINITIONS } from '@/lib/block-definitions';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'event', label: '事件', icon: Zap, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'control', label: '控制', icon: Terminal, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { id: 'action', label: '动作', icon: Box, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'sensing', label: '侦测', icon: Eye, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'data', label: '数据', icon: Database, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'operators', label: '运算', icon: FunctionSquare, color: 'bg-purple-100 text-purple-700 border-purple-200' },
];

interface DraggableBlockItemProps {
  type: string;
  def: {
    category: string;
    label: string;
    inputs: Record<string, any>;
  };
  onAdd: () => void;
}

function DraggableBlockItem({ type, def, onAdd }: DraggableBlockItemProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    // 设置拖拽数据
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'new-block',
      blockType: type,
      category: def.category,
      label: def.label,
      inputs: JSON.parse(JSON.stringify(def.inputs)),
    }));
    e.dataTransfer.effectAllowed = 'copy';
    
    // 设置拖拽图像
    const dragImage = document.createElement('div');
    dragImage.className = 'px-4 py-2 bg-white border-2 border-blue-400 rounded-lg shadow-lg';
    dragImage.textContent = def.label.replace(/%\d+/g, '...');
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onAdd}
      className={cn(
        'w-full text-left px-3 py-2 rounded-md text-sm cursor-grab active:cursor-grabbing transition-all',
        'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 truncate',
        'hover:shadow-sm hover:translate-x-1',
        isDragging && 'opacity-50 cursor-grabbing scale-95'
      )}
      title="拖拽到画布或点击添加"
    >
      {def.label.replace(/%\d+/g, '...')}
    </div>
  );
}

export function BlockPalette() {
  const { addBlock } = useStore();
  // 展开状态管理，默认展开"事件"和"动作"类别
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['event', 'action'])
  );
  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // 展开/折叠所有类别
  const expandAll = () => {
    setExpandedCategories(new Set(categories.map(c => c.id)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  // 获取所有积木定义
  const allBlocks = useMemo(() => {
    return Object.entries(BLOCK_DEFINITIONS).map(([type, def]) => ({ type, def }));
  }, []);

  // 根据搜索查询过滤积木
  const filteredBlocks = useMemo(() => {
    if (!searchQuery.trim()) {
      return allBlocks;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return allBlocks.filter(({ type, def }) => {
      const label = def.label.toLowerCase();
      const category = def.category.toLowerCase();
      const typeStr = type.toLowerCase();
      
      return label.includes(query) ||
             category.includes(query) ||
             typeStr.includes(query);
    });
  }, [allBlocks, searchQuery]);

  // 按类别分组过滤后的积木
  const blocksByCategory = useMemo(() => {
    const result: Record<string, Array<[string, any]>> = {};
    
    filteredBlocks.forEach(({ type, def }) => {
      const category = def.category;
      if (!result[category]) {
        result[category] = [];
      }
      result[category].push([type, def]);
    });
    
    return result;
  }, [filteredBlocks]);

  // 搜索时自动展开包含结果的类别
  useEffect(() => {
    if (searchQuery.trim()) {
      const categoriesWithResults = Object.keys(blocksByCategory);
      setExpandedCategories(new Set(categoriesWithResults));
    } else {
      // 恢复默认展开状态
      setExpandedCategories(new Set(['event', 'action']));
    }
  }, [searchQuery, blocksByCategory]);

  return (
    <div className="w-72 bg-white border-r border-neutral-200 flex flex-col h-full">
      <div className="p-4 border-b border-neutral-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-neutral-900">积木库</h2>
            <p className="text-xs text-neutral-500 mt-1">点击类别展开/折叠</p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={expandAll}
              className="p-1.5 text-xs text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
              title="展开全部"
            >
              展开
            </button>
            <button
              onClick={collapseAll}
              className="p-1.5 text-xs text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
              title="折叠全部"
            >
              折叠
            </button>
          </div>
        </div>
        
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索积木..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              title="清除搜索"
            >
              ×
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {searchQuery.trim() && filteredBlocks.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            <p>未找到匹配的积木</p>
            <p className="text-xs mt-1">尝试其他关键词</p>
          </div>
        ) : (
          categories
            .filter((cat) => {
              // 如果没有搜索查询或者该类别有积木，才显示类别
              const blocksInCategory = blocksByCategory[cat.id] || [];
              return !searchQuery.trim() || blocksInCategory.length > 0;
            })
            .map((cat) => {
              const isExpanded = expandedCategories.has(cat.id);
              const blocksInCategory = blocksByCategory[cat.id] || [];

              return (
                <div key={cat.id} className="rounded-lg overflow-hidden border border-neutral-100">
                  {/* 类别头部 - 可点击展开/折叠 */}
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 transition-all',
                      'hover:brightness-95 active:scale-[0.99]',
                      cat.color
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <cat.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{cat.label}</span>
                      <span className="text-xs opacity-60">
                        ({blocksInCategory.length})
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>

                  {/* 积木列表 - 可展开/折叠 */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden bg-neutral-50/50"
                      >
                        <div className="p-2 space-y-0.5">
                          {blocksInCategory.map(([type, def]) => (
                            <DraggableBlockItem
                              key={type}
                              type={type}
                              def={def}
                              onAdd={() => addBlock({
                                type,
                                category: def.category,
                                label: def.label,
                                inputs: JSON.parse(JSON.stringify(def.inputs)),
                              })}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
        )}
      </div>

      {/* 底部提示 */}
      <div className="p-3 border-t border-neutral-100 bg-neutral-50/50">
        <p className="text-xs text-neutral-400 text-center">
          共 {Object.keys(BLOCK_DEFINITIONS).length} 个积木块
        </p>
      </div>
    </div>
  );
}
