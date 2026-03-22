// src/components/game/CardEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Sword, Shield, Heart, Zap, Sparkles, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameElement, ValueType } from '@/types';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface CardEditorProps {
  isOpen: boolean;
  onClose: () => void;
  cardId?: string | null;
}

const CARD_TYPES = [
  { value: 'attack', label: '攻击卡', icon: Sword, color: 'text-red-500', bgColor: 'bg-red-50' },
  { value: 'defense', label: '防御卡', icon: Shield, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  { value: 'skill', label: '技能卡', icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
  { value: 'spell', label: '法术卡', icon: Sparkles, color: 'text-purple-500', bgColor: 'bg-purple-50' },
  { value: 'item', label: '物品卡', icon: Package, color: 'text-green-500', bgColor: 'bg-green-50' },
];

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981',
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
  '#71717A', '#1F2937',
];

export function CardEditor({ isOpen, onClose, cardId }: CardEditorProps) {
  const { project, addElement, updateElement } = useStore();
  const existingCard = cardId ? project.elements.find(e => e.id === cardId && e.type === 'card') : null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cardType, setCardType] = useState<string>('attack');
  const [color, setColor] = useState<string>(PRESET_COLORS[0]);
  const [image, setImage] = useState('');
  const [backImage, setBackImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [properties, setProperties] = useState<Array<{
    key: string;
    label: string;
    type: ValueType;
    value: any;
  }>>([
    { key: 'attack', label: '攻击力', type: 'number', value: 1 },
    { key: 'defense', label: '防御力', type: 'number', value: 1 },
    { key: 'hp', label: '生命值', type: 'number', value: 0 },
  ]);

  useEffect(() => {
    if (existingCard) {
      setName(existingCard.name);
      setDescription(existingCard.description || '');
      setCardType(existingCard.cardType || 'attack');
      setColor(existingCard.color || PRESET_COLORS[0]);
      setImage(existingCard.image || '');
      setBackImage(existingCard.backImage || '');
      setQuantity(existingCard.quantity || 1);
      
      // 解析属性
      const props = Object.entries(existingCard.properties).map(([key, prop]) => ({
        key,
        label: prop.label,
        type: prop.type,
        value: prop.value,
      }));
      if (props.length > 0) {
        setProperties(props);
      }
    } else {
      // 重置为默认值
      setName('');
      setDescription('');
      setCardType('attack');
      setColor(PRESET_COLORS[0]);
      setImage('');
      setBackImage('');
      setQuantity(1);
      setProperties([
        { key: 'attack', label: '攻击力', type: 'number', value: 1 },
        { key: 'defense', label: '防御力', type: 'number', value: 1 },
        { key: 'hp', label: '生命值', type: 'number', value: 0 },
      ]);
    }
  }, [existingCard, isOpen]);

  const handleAddProperty = () => {
    setProperties([...properties, {
      key: `prop${properties.length}`,
      label: '新属性',
      type: 'number',
      value: 0
    }]);
  };

  const handleRemoveProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const handlePropertyChange = (index: number, field: 'key' | 'label' | 'type' | 'value', value: string | number | boolean | ValueType | any[]) => {
    const newProperties = [...properties];
    if (field === 'key') {
      newProperties[index].key = value as string;
    } else if (field === 'label') {
      newProperties[index].label = value as string;
    } else if (field === 'type') {
      newProperties[index].type = value as ValueType;
      // 当类型改变时，重置值为该类型的默认值
      switch (value) {
        case 'string':
          newProperties[index].value = '';
          break;
        case 'number':
          newProperties[index].value = 0;
          break;
        case 'boolean':
          newProperties[index].value = false;
          break;
        case 'element':
        case 'player':
          newProperties[index].value = '';
          break;
        case 'list':
          newProperties[index].value = [];
          break;
      }
    } else {
      // value字段
      if (newProperties[index].type === 'number') {
        newProperties[index].value = Number(value);
      } else if (newProperties[index].type === 'boolean') {
        newProperties[index].value = Boolean(value);
      } else {
        newProperties[index].value = value;
      }
    }
    setProperties(newProperties);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    const propertiesRecord: GameElement['properties'] = {};
    properties.forEach(prop => {
      propertiesRecord[prop.key] = {
        type: prop.type,
        value: prop.value,
        label: prop.label,
      };
    });

    const cardData: Omit<GameElement, 'id'> = {
      name: name.trim(),
      type: 'card',
      description: description.trim(),
      cardType: cardType as any,
      color,
      image: image || undefined,
      backImage: backImage || undefined,
      quantity,
      properties: propertiesRecord,
      script: existingCard?.script || [],
      face: 'front',
      visible: true,
    };

    if (existingCard) {
      updateElement(cardId!, cardData);
    } else {
      addElement(cardData);
    }

    onClose();
  };

  // 渲染属性值输入控件
  const renderPropertyValueInput = (prop: typeof properties[0], index: number) => {
    switch (prop.type) {
      case 'string':
        return (
          <input
            type="text"
            value={prop.value}
            onChange={(e) => handlePropertyChange(index, 'value', e.target.value)}
            className="w-32 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            placeholder="文本值"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={prop.value}
            onChange={(e) => handlePropertyChange(index, 'value', e.target.value)}
            className="w-24 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        );
      case 'boolean':
        return (
          <select
            value={prop.value ? 'true' : 'false'}
            onChange={(e) => handlePropertyChange(index, 'value', e.target.value === 'true')}
            className="w-24 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="true">是</option>
            <option value="false">否</option>
          </select>
        );
      case 'element':
      case 'player':
        return (
          <input
            type="text"
            value={prop.value}
            onChange={(e) => handlePropertyChange(index, 'value', e.target.value)}
            className="w-32 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            placeholder="ID"
          />
        );
      case 'list':
        return (
          <input
            type="text"
            value={Array.isArray(prop.value) ? prop.value.join(', ') : ''}
            onChange={(e) => {
              const items = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
              handlePropertyChange(index, 'value', items);
            }}
            className="w-32 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            placeholder="逗号分隔"
          />
        );
      default:
        return null;
    }
  };

  const selectedType = CARD_TYPES.find(t => t.value === cardType);
  const TypeIcon = selectedType?.icon || Sword;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingCard ? '编辑卡牌' : '创建卡牌'} className="max-w-2xl">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* 卡牌预览 */}
        <div className="flex justify-center">
          <div
            className="w-32 h-44 rounded-xl shadow-lg flex flex-col items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: color }}
          >
            {image ? (
              <img src={image} alt={name} className="w-full h-full object-cover" />
            ) : (
              <>
                <TypeIcon className="w-12 h-12 text-white/80 mb-2" />
                <span className="text-white text-sm font-medium px-2 text-center line-clamp-2">
                  {name || '未命名'}
                </span>
              </>
            )}
            {quantity > 1 && (
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full">
                x{quantity}
              </div>
            )}
          </div>
        </div>

        {/* 基本信息 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">卡牌名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入卡牌名称"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">数量</label>
            <input
              type="number"
              min={1}
              max={99}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            <p className="text-xs text-neutral-400 mt-1">此卡牌在牌堆中的默认数量</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="输入卡牌描述"
            rows={2}
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
          />
        </div>

        {/* 卡牌类型 */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">卡牌类型</label>
          <div className="grid grid-cols-5 gap-2">
            {CARD_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setCardType(type.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
                    cardType === type.value
                      ? `border-current ${type.color} ${type.bgColor}`
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 颜色选择 */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">主题颜色</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  'w-8 h-8 rounded-lg border-2 transition-all',
                  color === c ? 'border-neutral-900 scale-110' : 'border-transparent hover:scale-105'
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* 图片 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">正面图片 URL</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">背面图片 URL</label>
            <input
              type="text"
              value={backImage}
              onChange={(e) => setBackImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* 属性 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-neutral-700">属性</label>
            <Button variant="ghost" size="sm" onClick={handleAddProperty}>
              <Plus className="w-4 h-4 mr-1" />
              添加属性
            </Button>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {properties.map((prop, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-12 gap-2 items-center"
                >
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={prop.key}
                      onChange={(e) => handlePropertyChange(index, 'key', e.target.value)}
                      placeholder="键名"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={prop.label}
                      onChange={(e) => handlePropertyChange(index, 'label', e.target.value)}
                      placeholder="显示名称"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={prop.type}
                      onChange={(e) => handlePropertyChange(index, 'type', e.target.value as ValueType)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
                    >
                      <option value="string">字符串</option>
                      <option value="number">数字</option>
                      <option value="boolean">布尔值</option>
                      <option value="element">元素</option>
                      <option value="player">玩家</option>
                      <option value="list">列表</option>
                    </select>
                  </div>
                  <div className="col-span-3">
                    {renderPropertyValueInput(prop, index)}
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => handleRemoveProperty(index)}
                      className="p-2 hover:bg-red-50 rounded-lg text-neutral-400 hover:text-red-500 transition-colors"
                      title="删除属性"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
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
            {existingCard ? '保存' : '创建'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
