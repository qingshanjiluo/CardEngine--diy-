// src/components/game/DeckEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Layers, Shuffle, Eye, Package, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameElement, DeckCardEntry } from '@/types';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface DeckEditorProps {
  isOpen: boolean;
  onClose: () => void;
  deckId?: string | null;
}

interface CardWithQuantity {
  card: GameElement;
  quantity: number;
}

export function DeckEditor({ isOpen, onClose, deckId }: DeckEditorProps) {
  const { project, addElement, updateElement, addCardToDeck, removeCardFromDeck, updateCardQuantityInDeck, getDeckCards } = useStore();
  const existingDeck = deckId ? project.elements.find(e => e.id === deckId && e.type === 'deck') : null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [backImage, setBackImage] = useState('');
  const [selectedCards, setSelectedCards] = useState<CardWithQuantity[]>([]);
  const [showCardSelector, setShowCardSelector] = useState(false);

  // 获取所有可用卡牌
  const availableCards = project.elements.filter(e => e.type === 'card');

  useEffect(() => {
    if (existingDeck) {
      setName(existingDeck.name);
      setDescription(existingDeck.description || '');
      setBackImage(existingDeck.backImage || '');
      setSelectedCards(getDeckCards(deckId!));
    } else {
      setName('');
      setDescription('');
      setBackImage('');
      setSelectedCards([]);
    }
  }, [existingDeck, deckId, isOpen, getDeckCards]);

  const handleAddCard = (card: GameElement) => {
    const existing = selectedCards.find(sc => sc.card.id === card.id);
    if (existing) {
      handleUpdateQuantity(card.id, existing.quantity + 1);
    } else {
      if (deckId) {
        addCardToDeck(deckId, card.id, 1);
      }
      setSelectedCards([...selectedCards, { card, quantity: 1 }]);
    }
    setShowCardSelector(false);
  };

  const handleRemoveCard = (cardId: string) => {
    if (deckId) {
      removeCardFromDeck(deckId, cardId);
    }
    setSelectedCards(selectedCards.filter(sc => sc.card.id !== cardId));
  };

  const handleUpdateQuantity = (cardId: string, quantity: number) => {
    const validQuantity = Math.max(0, Math.min(99, quantity));
    if (deckId) {
      updateCardQuantityInDeck(deckId, cardId, validQuantity);
    }
    setSelectedCards(selectedCards.map(sc => 
      sc.card.id === cardId ? { ...sc, quantity: validQuantity } : sc
    ).filter(sc => sc.quantity > 0));
  };

  const getTotalCards = () => {
    return selectedCards.reduce((sum, sc) => sum + sc.quantity, 0);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    const deckContent = {
      cards: selectedCards.map(sc => ({
        cardId: sc.card.id,
        quantity: sc.quantity,
      })),
    };

    const deckData: Omit<GameElement, 'id'> = {
      name: name.trim(),
      type: 'deck',
      description: description.trim(),
      backImage: backImage || undefined,
      deckContent,
      properties: existingDeck?.properties || {},
      script: existingDeck?.script || [],
      face: 'back',
      visible: true,
    };

    if (existingDeck) {
      updateElement(deckId!, deckData);
    } else {
      addElement(deckData);
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingDeck ? '编辑牌堆' : '创建牌堆'} className="max-w-3xl">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* 牌堆预览 */}
        <div className="flex items-center gap-6 p-4 bg-neutral-50 rounded-xl">
          <div className="relative">
            <div
              className="w-24 h-36 rounded-lg shadow-lg flex items-center justify-center"
              style={{ backgroundColor: '#1F2937' }}
            >
              {backImage ? (
                <img src={backImage} alt="牌背" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-center">
                  <Layers className="w-8 h-8 text-neutral-400 mx-auto mb-1" />
                  <span className="text-neutral-500 text-xs">牌背</span>
                </div>
              )}
            </div>
            <div className="absolute -top-2 -right-2 bg-brand-500 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shadow">
              {getTotalCards()}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900">{name || '未命名牌堆'}</h3>
            <p className="text-sm text-neutral-500 mt-1">{getTotalCards()} 张卡牌</p>
            {description && <p className="text-sm text-neutral-600 mt-2">{description}</p>}
          </div>
        </div>

        {/* 基本信息 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">牌堆名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入牌堆名称"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">牌背图片 URL</label>
            <input
              type="text"
              value={backImage}
              onChange={(e) => setBackImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="输入牌堆描述"
            rows={2}
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
          />
        </div>

        {/* 卡牌列表 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-neutral-700">
              卡牌列表 <span className="text-neutral-400">({getTotalCards()} 张)</span>
            </label>
            <Button variant="primary" size="sm" onClick={() => setShowCardSelector(true)}>
              <Plus className="w-4 h-4 mr-1" />
              添加卡牌
            </Button>
          </div>

          {selectedCards.length === 0 ? (
            <div className="text-center py-8 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200">
              <Package className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">牌堆为空，点击上方按钮添加卡牌</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {selectedCards.map(({ card, quantity }) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-lg hover:border-brand-300 transition-colors"
                  >
                    {/* 卡牌缩略图 */}
                    <div
                      className="w-10 h-14 rounded flex-shrink-0 overflow-hidden"
                      style={{ backgroundColor: card.color || '#5686FE' }}
                    >
                      {card.image ? (
                        <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{card.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>

                    {/* 卡牌信息 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{card.name}</p>
                      <p className="text-xs text-neutral-500">
                        {card.cardType === 'attack' && '攻击卡'}
                        {card.cardType === 'defense' && '防御卡'}
                        {card.cardType === 'skill' && '技能卡'}
                        {card.cardType === 'spell' && '法术卡'}
                        {card.cardType === 'item' && '物品卡'}
                        {!card.cardType && '卡牌'}
                      </p>
                    </div>

                    {/* 数量控制 */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(card.id, quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(card.id, quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 删除按钮 */}
                    <button
                      onClick={() => handleRemoveCard(card.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            取消
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            {existingDeck ? '保存' : '创建'}
          </Button>
        </div>
      </div>

      {/* 卡牌选择器 */}
      <CardSelectorModal
        isOpen={showCardSelector}
        onClose={() => setShowCardSelector(false)}
        availableCards={availableCards}
        selectedCardIds={selectedCards.map(sc => sc.card.id)}
        onSelectCard={handleAddCard}
      />
    </Modal>
  );
}

// 卡牌选择器模态框
interface CardSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCards: GameElement[];
  selectedCardIds: string[];
  onSelectCard: (card: GameElement) => void;
}

function CardSelectorModal({ isOpen, onClose, availableCards, selectedCardIds, onSelectCard }: CardSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCards = availableCards.filter(card => 
    card.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="选择卡牌" className="max-w-lg">
      <div className="space-y-4">
        {/* 搜索框 */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索卡牌..."
          className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        />

        {/* 卡牌列表 */}
        <div className="max-h-80 overflow-y-auto space-y-2">
          {filteredCards.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              未找到匹配的卡牌
            </div>
          ) : (
            filteredCards.map((card) => {
              const isSelected = selectedCardIds.includes(card.id);
              return (
                <button
                  key={card.id}
                  onClick={() => onSelectCard(card)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                    isSelected
                      ? 'bg-brand-50 border-brand-200'
                      : 'bg-white border-neutral-200 hover:border-brand-300'
                  )}
                >
                  <div
                    className="w-10 h-14 rounded flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: card.color || '#5686FE' }}
                  >
                    {card.image ? (
                      <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{card.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{card.name}</p>
                    <p className="text-xs text-neutral-500 line-clamp-1">{card.description || '暂无描述'}</p>
                  </div>
                  {isSelected && (
                    <span className="text-xs text-brand-600 font-medium">已添加</span>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
        </div>
      </div>
    </Modal>
  );
}
