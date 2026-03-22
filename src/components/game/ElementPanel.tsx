// src/components/game/ElementPanel.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Edit2, Layers, Box, 
  Square, Image as ImageIcon, Settings,
  ChevronDown, ChevronRight, Sword, Shield, Zap, Sparkles, Package,
  Copy
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { GameElement, ElementType } from '@/types';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CardEditor } from './CardEditor';
import { PropEditor } from './PropEditor';
import { DeckEditor } from './DeckEditor';

// 获取卡牌类型图标
function getCardTypeIcon(cardType?: string) {
  switch (cardType) {
    case 'attack': return <Sword className="w-3 h-3 text-red-500" />;
    case 'defense': return <Shield className="w-3 h-3 text-blue-500" />;
    case 'skill': return <Zap className="w-3 h-3 text-yellow-500" />;
    case 'spell': return <Sparkles className="w-3 h-3 text-purple-500" />;
    case 'item': return <Package className="w-3 h-3 text-green-500" />;
    default: return null;
  }
}

// 获取卡牌类型标签
function getCardTypeLabel(cardType?: string) {
  switch (cardType) {
    case 'attack': return '攻击';
    case 'defense': return '防御';
    case 'skill': return '技能';
    case 'spell': return '法术';
    case 'item': return '物品';
    default: return '';
  }
}

export function ElementPanel() {
  const { 
    project, 
    selectedElement, 
    setSelectedElement,
    addElement,
    deleteElement,
    duplicateCard
  } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingPropId, setEditingPropId] = useState<string | null>(null);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [expandedTypes, setExpandedTypes] = useState<Record<ElementType, boolean>>({
    card: true,
    prop: true,
    deck: true
  });

  const elementsByType = {
    card: project.elements.filter(e => e.type === 'card'),
    prop: project.elements.filter(e => e.type === 'prop'),
    deck: project.elements.filter(e => e.type === 'deck'),
  };

  const toggleType = (type: ElementType) => {
    setExpandedTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleEditElement = (element: GameElement) => {
    if (element.type === 'card') {
      setEditingCardId(element.id);
    } else if (element.type === 'prop') {
      setEditingPropId(element.id);
    } else if (element.type === 'deck') {
      setEditingDeckId(element.id);
    }
  };

  const handleDuplicateCard = (e: React.MouseEvent, cardId: string) => {
    e.stopPropagation();
    duplicateCard(cardId, 1);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          共 {project.elements.length} 个元素
        </span>
        <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-1" />
          新建
        </Button>
      </div>

      {/* Element Lists by Type */}
      <div className="flex-1 overflow-auto space-y-2">
        {(Object.keys(elementsByType) as ElementType[]).map((type) => (
          <div key={type} className="border border-neutral-100 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleType(type)}
              className="w-full flex items-center justify-between px-3 py-2 bg-neutral-50 hover:bg-neutral-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                {type === 'card' && <Square className="w-4 h-4 text-brand-500" />}
                {type === 'prop' && <Box className="w-4 h-4 text-amber-500" />}
                {type === 'deck' && <Layers className="w-4 h-4 text-emerald-500" />}
                <span className="text-sm font-medium text-neutral-700">
                  {type === 'card' && '卡牌'}
                  {type === 'prop' && '道具'}
                  {type === 'deck' && '牌堆'}
                </span>
                <span className="text-xs text-neutral-400 bg-white px-1.5 py-0.5 rounded">
                  {elementsByType[type].length}
                </span>
              </div>
              {expandedTypes[type] ? (
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              )}
            </button>

            <AnimatePresence>
              {expandedTypes[type] && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-2 space-y-1">
                    {elementsByType[type].map((element) => (
                      <ElementItem
                        key={element.id}
                        element={element}
                        isSelected={selectedElement === element.id}
                        onSelect={() => setSelectedElement(element.id)}
                        onDelete={() => deleteElement(element.id)}
                        onEdit={() => handleEditElement(element)}
                        onDuplicate={type === 'card' ? (e) => handleDuplicateCard(e, element.id) : undefined}
                      />
                    ))}
                    {elementsByType[type].length === 0 && (
                      <p className="text-xs text-neutral-400 text-center py-4">
                        暂无{type === 'card' ? '卡牌' : type === 'prop' ? '道具' : '牌堆'}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Add Element Modal */}
      <AddElementModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />

      {/* Card Editor */}
      <CardEditor
        isOpen={!!editingCardId}
        onClose={() => setEditingCardId(null)}
        cardId={editingCardId}
      />

      {/* Prop Editor */}
      <PropEditor
        isOpen={!!editingPropId}
        onClose={() => setEditingPropId(null)}
        propId={editingPropId}
      />

      {/* Deck Editor */}
      <DeckEditor
        isOpen={!!editingDeckId}
        onClose={() => setEditingDeckId(null)}
        deckId={editingDeckId}
      />
    </div>
  );
}

interface ElementItemProps {
  element: GameElement;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onDuplicate?: (e: React.MouseEvent) => void;
}

function ElementItem({ element, isSelected, onSelect, onDelete, onEdit, onDuplicate }: ElementItemProps) {
  // 计算卡牌数量（牌堆用）
  const getCardCount = () => {
    if (element.type === 'deck' && element.deckContent?.cards) {
      return element.deckContent.cards.reduce((sum, c) => sum + c.quantity, 0);
    }
    return element.quantity || 1;
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all',
        isSelected 
          ? 'bg-brand-50 border border-brand-200' 
          : 'hover:bg-neutral-50 border border-transparent'
      )}
    >
      {/* Thumbnail */}
      <div 
        className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={element.color && !element.image ? { backgroundColor: element.color } : undefined}
      >
        {element.image ? (
          <img 
            src={element.image} 
            alt={element.name}
            className="w-full h-full object-cover"
          />
        ) : element.type === 'card' ? (
          <span className="text-white text-xs font-bold">{element.name.charAt(0)}</span>
        ) : element.type === 'prop' ? (
          <Box className="w-4 h-4 text-white" />
        ) : (
          <Layers className="w-4 h-4 text-neutral-400" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={cn(
            'text-sm font-medium truncate',
            isSelected ? 'text-brand-700' : 'text-neutral-700'
          )}>
            {element.name}
          </p>
          {element.type === 'card' && getCardTypeIcon(element.cardType)}
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          {element.type === 'card' && element.cardType && (
            <span>{getCardTypeLabel(element.cardType)}</span>
          )}
          {element.type === 'deck' ? (
            <span>{getCardCount()} 张卡牌</span>
          ) : (
            <span>x{getCardCount()}</span>
          )}
          {element.script.length > 0 && (
            <span>· {element.script.length} 脚本</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onDuplicate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(e);
            }}
            className="p-1 hover:bg-blue-50 rounded text-neutral-400 hover:text-blue-500 transition-colors"
            title="复制"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1 hover:bg-brand-50 rounded text-neutral-400 hover:text-brand-500 transition-colors"
          title="编辑"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:bg-red-50 rounded text-neutral-400 hover:text-red-500 transition-colors"
          title="删除"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

interface AddElementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddElementModal({ isOpen, onClose }: AddElementModalProps) {
  const { addElement } = useStore();
  const [name, setName] = useState('');
  const [type, setType] = useState<ElementType>('card');
  const [image, setImage] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    const baseElement = {
      name: name.trim(),
      type,
      image: image || undefined,
      properties: {} as Record<string, any>,
      script: [],
      face: 'front' as const,
      visible: true,
    };

    if (type === 'card') {
      addElement({
        ...baseElement,
        properties: {
          attack: { type: 'number', value: 1, label: '攻击力' },
          defense: { type: 'number', value: 1, label: '防御力' },
        },
        cardType: 'attack',
        color: '#EF4444',
        quantity: 1,
      });
    } else if (type === 'prop') {
      addElement({
        ...baseElement,
        properties: {},
        color: '#10B981',
        propEffect: '',
        useCount: 1,
        maxUseCount: 1,
        iconType: 'box',
      });
    } else {
      addElement({
        ...baseElement,
        face: 'back',
        deckContent: { cards: [] },
      });
    }

    setName('');
    setType('card');
    setImage('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新建元素">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">类型</label>
          <div className="grid grid-cols-3 gap-2">
            {(['card', 'prop', 'deck'] as ElementType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                  type === t
                    ? 'bg-brand-50 border-brand-500 text-brand-700'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
                )}
              >
                {t === 'card' && '卡牌'}
                {t === 'prop' && '道具'}
                {t === 'deck' && '牌堆'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`输入${type === 'card' ? '卡牌' : type === 'prop' ? '道具' : '牌堆'}名称`}
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">图片URL（可选）</label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/image.png"
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            取消
          </Button>
          <Button 
            variant="primary" 
            className="flex-1" 
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            创建
          </Button>
        </div>
      </div>
    </Modal>
  );
}
