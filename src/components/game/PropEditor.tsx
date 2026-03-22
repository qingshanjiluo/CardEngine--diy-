// src/components/game/PropEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Box, Package, FlaskConical, Scroll, Gem, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameElement } from '@/types';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface PropEditorProps {
  isOpen: boolean;
  onClose: () => void;
  propId?: string | null;
}

const PROP_ICONS = [
  { value: 'box', label: '盒子', icon: Box },
  { value: 'package', label: '包裹', icon: Package },
  { value: 'potion', label: '药水', icon: FlaskConical },
  { value: 'scroll', label: '卷轴', icon: Scroll },
  { value: 'gem', label: '宝石', icon: Gem },
  { value: 'key', label: '钥匙', icon: Key },
];

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981',
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
  '#71717A', '#1F2937',
];

export function PropEditor({ isOpen, onClose, propId }: PropEditorProps) {
  const { project, addElement, updateElement } = useStore();
  const existingProp = propId ? project.elements.find(e => e.id === propId && e.type === 'prop') : null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [propEffect, setPropEffect] = useState('');
  const [color, setColor] = useState<string>(PRESET_COLORS[4]);
  const [iconType, setIconType] = useState<string>('box');
  const [useCount, setUseCount] = useState(1);
  const [maxUseCount, setMaxUseCount] = useState(1);
  const [properties, setProperties] = useState<Array<{ key: string; label: string; value: number }>>([]);

  useEffect(() => {
    if (existingProp) {
      setName(existingProp.name);
      setDescription(existingProp.description || '');
      setPropEffect(existingProp.propEffect || '');
      setColor(existingProp.color || PRESET_COLORS[4]);
      setIconType(existingProp.iconType || 'box');
      setUseCount(existingProp.useCount || 1);
      setMaxUseCount(existingProp.maxUseCount || 1);
      
      const props = Object.entries(existingProp.properties).map(([key, prop]) => ({
        key,
        label: prop.label,
        value: prop.value as number,
      }));
      setProperties(props);
    } else {
      setName('');
      setDescription('');
      setPropEffect('');
      setColor(PRESET_COLORS[4]);
      setIconType('box');
      setUseCount(1);
      setMaxUseCount(1);
      setProperties([]);
    }
  }, [existingProp, isOpen]);

  const handleAddProperty = () => {
    setProperties([...properties, { key: `prop${properties.length}`, label: '新属性', value: 0 }]);
  };

  const handleRemoveProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const handlePropertyChange = (index: number, field: 'label' | 'value', value: string | number) => {
    const newProperties = [...properties];
    if (field === 'label') {
      newProperties[index].label = value as string;
    } else {
      newProperties[index].value = Number(value);
    }
    setProperties(newProperties);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    const propertiesRecord: GameElement['properties'] = {};
    properties.forEach(prop => {
      propertiesRecord[prop.key] = {
        type: 'number',
        value: prop.value,
        label: prop.label,
      };
    });

    const propData: Omit<GameElement, 'id'> = {
      name: name.trim(),
      type: 'prop',
      description: description.trim(),
      propEffect: propEffect.trim(),
      color,
      iconType,
      useCount,
      maxUseCount,
      image: undefined,
      properties: propertiesRecord,
      script: existingProp?.script || [],
      face: 'front',
      visible: true,
    };

    if (existingProp) {
      updateElement(propId!, propData);
    } else {
      addElement(propData);
    }

    onClose();
  };

  const selectedIcon = PROP_ICONS.find(i => i.value === iconType);
  const IconComponent = selectedIcon?.icon || Box;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingProp ? '编辑道具' : '创建道具'} className="max-w-2xl">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* 道具预览 */}
        <div className="flex justify-center">
          <div
            className="w-24 h-24 rounded-2xl shadow-lg flex items-center justify-center relative"
            style={{ backgroundColor: color }}
          >
            <IconComponent className="w-10 h-10 text-white" />
            {useCount > 1 && (
              <div className="absolute -top-1 -right-1 bg-white text-neutral-800 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                {useCount}
              </div>
            )}
          </div>
        </div>

        {/* 基本信息 */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">道具名称 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入道具名称"
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="输入道具描述"
            rows={2}
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">效果描述</label>
          <textarea
            value={propEffect}
            onChange={(e) => setPropEffect(e.target.value)}
            placeholder="描述道具的效果，如：恢复10点生命值"
            rows={2}
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
          />
        </div>

        {/* 图标选择 */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">图标</label>
          <div className="flex flex-wrap gap-2">
            {PROP_ICONS.map((icon) => {
              const Icon = icon.icon;
              return (
                <button
                  key={icon.value}
                  onClick={() => setIconType(icon.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all min-w-[70px]',
                    iconType === icon.value
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{icon.label}</span>
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

        {/* 使用次数 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">当前使用次数</label>
            <input
              type="number"
              min={0}
              max={99}
              value={useCount}
              onChange={(e) => setUseCount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">最大使用次数</label>
            <input
              type="number"
              min={1}
              max={99}
              value={maxUseCount}
              onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value) || 1);
                setMaxUseCount(val);
                if (useCount > val) setUseCount(val);
              }}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* 属性 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-neutral-700">属性（可选）</label>
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
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={prop.label}
                    onChange={(e) => handlePropertyChange(index, 'label', e.target.value)}
                    placeholder="属性名称"
                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <input
                    type="number"
                    value={prop.value}
                    onChange={(e) => handlePropertyChange(index, 'value', e.target.value)}
                    className="w-24 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <button
                    onClick={() => handleRemoveProperty(index)}
                    className="p-2 hover:bg-red-50 rounded-lg text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {properties.length === 0 && (
              <p className="text-sm text-neutral-400 text-center py-4">
                暂无属性，点击添加
              </p>
            )}
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
            {existingProp ? '保存' : '创建'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
