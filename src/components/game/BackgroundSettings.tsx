// src/components/game/BackgroundSettings.tsx
'use client';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/lib/store';
import { useState } from 'react';

const BACKGROUND_TYPES = [
  { value: 'solid', label: '纯色' },
  { value: 'gradient', label: '渐变' },
  { value: 'image', label: '图片' },
] as const;

const GRID_STYLES = [
  { value: 'none', label: '无网格' },
  { value: 'dots', label: '点状网格' },
  { value: 'lines', label: '线状网格' },
] as const;

const PRESET_COLORS = [
  '#FAFAFA', // 浅灰
  '#F0F0F0', // 浅灰2
  '#E8E8E8', // 浅灰3
  '#1A1A1A', // 深灰
  '#FFFFFF', // 白色
  '#F5F5F5', // 浅白
  '#E0E0E0', // 中灰
  '#B0B0B0', // 灰
  '#808080', // 深灰
  '#404040', // 深灰2
];

const PLAYER_COLOR_PRESETS = [
  ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0'], // 红、青绿、黄、绿
  ['#118AB2', '#EF476F', '#FFD166', '#06D6A0'], // 蓝、粉红、黄、绿
  ['#7209B7', '#3A86FF', '#FB5607', '#8338EC'], // 紫、蓝、橙、紫红
  ['#264653', '#2A9D8F', '#E9C46A', '#F4A261'], // 深绿、青绿、黄、橙
];

interface BackgroundSettingsProps {
  className?: string;
}

export function BackgroundSettings({ className }: BackgroundSettingsProps) {
  const { project, updateProjectSettings } = useStore();
  const { background, gridStyle, playerColors } = project.settings;
  
  const [customColor, setCustomColor] = useState(background.type === 'solid' ? background.value : '#FAFAFA');
  const [gradientFrom, setGradientFrom] = useState('#3A86FF');
  const [gradientTo, setGradientTo] = useState('#8338EC');
  const [imageUrl, setImageUrl] = useState(background.type === 'image' ? background.value : '');

  const handleBackgroundTypeChange = (type: 'solid' | 'gradient' | 'image') => {
    let value = '';
    switch (type) {
      case 'solid':
        value = customColor;
        break;
      case 'gradient':
        value = `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`;
        break;
      case 'image':
        value = imageUrl || 'https://images.unsplash.com/photo-1519681393784-d120267933ba';
        break;
    }
    updateProjectSettings({ background: { type, value } });
  };

  const handleSolidColorChange = (color: string) => {
    setCustomColor(color);
    if (background.type === 'solid') {
      updateProjectSettings({ background: { type: 'solid', value: color } });
    }
  };

  const handleGradientChange = () => {
    const gradientValue = `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`;
    updateProjectSettings({ background: { type: 'gradient', value: gradientValue } });
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    if (background.type === 'image') {
      updateProjectSettings({ background: { type: 'image', value: url } });
    }
  };

  const handleGridStyleChange = (style: 'none' | 'dots' | 'lines') => {
    updateProjectSettings({ gridStyle: style });
  };

  const handlePlayerColorChange = (index: number, color: string) => {
    const newColors = [...playerColors];
    newColors[index] = color;
    updateProjectSettings({ playerColors: newColors });
  };

  const applyPlayerColorPreset = (presetIndex: number) => {
    const preset = PLAYER_COLOR_PRESETS[presetIndex];
    const newColors = [...playerColors];
    for (let i = 0; i < Math.min(preset.length, newColors.length); i++) {
      newColors[i] = preset[i];
    }
    updateProjectSettings({ playerColors: newColors });
  };

  return (
    <div className={className}>
      <Card className="p-6 space-y-6">
        <h3 className="font-semibold text-neutral-900">背景设置</h3>
        
        {/* 背景类型选择 */}
        <div>
          <label className="text-xs font-medium text-neutral-600 mb-1.5 block">背景类型</label>
          <div className="flex gap-2">
            {BACKGROUND_TYPES.map((type) => (
              <Button
                key={type.value}
                variant={background.type === type.value ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleBackgroundTypeChange(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 纯色背景设置 */}
        {background.type === 'solid' && (
          <div>
            <label className="text-xs font-medium text-neutral-600 mb-1.5 block">纯色选择</label>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleSolidColorChange(color)}
                    className={`w-10 h-10 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      customColor === color ? 'border-brand-500' : 'border-neutral-200'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg border border-neutral-200"
                  style={{ backgroundColor: customColor }}
                />
                <Input
                  type="text"
                  value={customColor}
                  onChange={(e) => handleSolidColorChange(e.target.value)}
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* 渐变背景设置 */}
        {background.type === 'gradient' && (
          <div>
            <label className="text-xs font-medium text-neutral-600 mb-1.5 block">渐变设置</label>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-600 mb-1.5 block">起始颜色</label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg border border-neutral-200"
                      style={{ backgroundColor: gradientFrom }}
                    />
                    <Input
                      type="text"
                      value={gradientFrom}
                      onChange={(e) => setGradientFrom(e.target.value)}
                      placeholder="#3A86FF"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-600 mb-1.5 block">结束颜色</label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg border border-neutral-200"
                      style={{ backgroundColor: gradientTo }}
                    />
                    <Input
                      type="text"
                      value={gradientTo}
                      onChange={(e) => setGradientTo(e.target.value)}
                      placeholder="#8338EC"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <div 
                className="w-full h-32 rounded-lg border border-neutral-200"
                style={{ 
                  background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`
                }}
              />
              <Button onClick={handleGradientChange} variant="primary">
                应用渐变
              </Button>
            </div>
          </div>
        )}

        {/* 图片背景设置 */}
        {background.type === 'image' && (
          <div>
            <label className="text-xs font-medium text-neutral-600 mb-1.5 block">图片背景</label>
            <div className="space-y-4">
              <Input
                type="text"
                value={imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="输入图片URL或选择预设"
                className="w-full"
              />
              <div className="grid grid-cols-3 gap-2">
                {[
                  'https://images.unsplash.com/photo-1519681393784-d120267933ba',
                  'https://images.unsplash.com/photo-1550684376-efcbd6e3f031',
                  'https://images.unsplash.com/photo-1542751371-adc38448a05e',
                ].map((url) => (
                  <button
                    key={url}
                    onClick={() => handleImageUrlChange(url)}
                    className={`aspect-video rounded-lg border-2 overflow-hidden ${
                      imageUrl === url ? 'border-brand-500' : 'border-neutral-200'
                    }`}
                  >
                    <img 
                      src={url} 
                      alt="背景预览" 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              {imageUrl && (
                <div 
                  className="w-full h-48 rounded-lg border border-neutral-200 bg-cover bg-center"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
              )}
            </div>
          </div>
        )}

        {/* 网格样式设置 */}
        <div>
          <label className="text-xs font-medium text-neutral-600 mb-1.5 block">网格样式</label>
          <div className="flex gap-2">
            {GRID_STYLES.map((style) => (
              <Button
                key={style.value}
                variant={gridStyle === style.value ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleGridStyleChange(style.value)}
              >
                {style.label}
              </Button>
            ))}
          </div>
          <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
            <div className="text-xs text-neutral-500 mb-2">预览效果：</div>
            <div className="relative w-full h-32 bg-white rounded border border-neutral-200 overflow-hidden">
              {/* 网格预览 */}
              {gridStyle === 'dots' && (
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px',
                }} />
              )}
              {gridStyle === 'lines' && (
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                }} />
              )}
              {gridStyle === 'none' && (
                <div className="flex items-center justify-center h-full text-neutral-400">
                  无网格
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 玩家配色设置 */}
        <div>
          <label className="text-xs font-medium text-neutral-600 mb-1.5 block">玩家配色</label>
          <div className="space-y-4">
            <div className="text-xs text-neutral-500 mb-2">预设配色方案：</div>
            <div className="grid grid-cols-2 gap-3">
              {PLAYER_COLOR_PRESETS.map((preset, presetIndex) => (
                <button
                  key={presetIndex}
                  onClick={() => applyPlayerColorPreset(presetIndex)}
                  className="p-3 rounded-lg border border-neutral-200 hover:border-brand-500 transition-colors"
                >
                  <div className="flex gap-1 mb-2">
                    {preset.map((color, i) => (
                      <div
                        key={i}
                        className="flex-1 h-6 rounded"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-neutral-600 text-center">
                    方案 {presetIndex + 1}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="text-xs text-neutral-500 mb-2">自定义玩家颜色：</div>
            <div className="grid grid-cols-2 gap-4">
              {playerColors.map((color, index) => (
                <div key={index}>
                  <label className="text-xs font-medium text-neutral-600 mb-1.5 block">
                    玩家 {index + 1}
                  </label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg border border-neutral-200"
                      style={{ backgroundColor: color }}
                    />
                    <Input
                      type="text"
                      value={color}
                      onChange={(e) => handlePlayerColorChange(index, e.target.value)}
                      placeholder="#FF6B6B"
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}