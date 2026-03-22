// src/components/game/AssetsLibrary.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/Modal';
import { useStore } from '@/lib/store';
import {
  ASSET_CATEGORIES,
  ALL_ASSETS,
  getAssetsByCategory,
  AssetItem,
  AssetCategory,
} from '@/lib/assets-library';
import { Search, Download, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssetsLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AssetsLibrary({ isOpen, onClose }: AssetsLibraryProps) {
  const { addElement, updateProjectSettings } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(null);

  // 获取当前分类的素材
  const currentCategory = ASSET_CATEGORIES.find(cat => cat.id === selectedCategory);
  const assets = getAssetsByCategory(selectedCategory);
  
  // 搜索过滤
  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApplyAsset = (asset: AssetItem) => {
    switch (asset.type) {
      case 'card':
      case 'prop':
      case 'deck':
        // 添加为元素
        addElement({
          ...asset.data,
          name: `${asset.name} (副本)`,
        });
        break;
      case 'background':
        // 更新项目背景设置
        updateProjectSettings({
          background: asset.data,
        });
        break;
      case 'icon':
        // 图标目前仅作为参考，不直接应用
        console.log('图标素材:', asset);
        break;
    }
    
    // 显示成功提示
    alert(`已应用素材: ${asset.name}`);
    setSelectedAsset(null);
  };

  const handlePreview = (asset: AssetItem) => {
    setSelectedAsset(asset);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="内置素材库"
        className="max-w-6xl max-h-[90vh]"
      >
        <div className="flex flex-col h-full">
          {/* 搜索栏 */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="搜索素材..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-1 gap-6 min-h-0">
            {/* 左侧分类导航 */}
            <div className="w-48 flex-shrink-0">
              <div className="space-y-1">
                {ASSET_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3',
                      selectedCategory === category.id
                        ? 'bg-brand-50 text-brand-700 border border-brand-100'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    )}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-neutral-500">{category.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 右侧素材网格 */}
            <div className="flex-1 overflow-auto">
              {currentCategory && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                    <span>{currentCategory.icon}</span>
                    {currentCategory.name}
                    <span className="text-sm font-normal text-neutral-500">
                      ({filteredAssets.length} 个素材)
                    </span>
                  </h3>
                  <p className="text-sm text-neutral-600">{currentCategory.description}</p>
                </div>
              )}

              {filteredAssets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-neutral-400 mb-2">未找到相关素材</div>
                  <p className="text-sm text-neutral-500">尝试其他分类或搜索关键词</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAssets.map((asset) => (
                    <Card
                      key={asset.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => handlePreview(asset)}
                    >
                      <div className="aspect-video bg-neutral-100 overflow-hidden relative">
                        {asset.preview ? (
                          <img
                            src={asset.preview}
                            alt={asset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            无预览
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {asset.type}
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-neutral-900 mb-1">{asset.name}</h4>
                        <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                          {asset.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyAsset(asset);
                            }}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            应用
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(asset);
                            }}
                          >
                            预览
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200 mt-6">
            <div className="text-sm text-neutral-600">
              <p>💡 提示：点击"应用"按钮将素材添加到当前项目中，点击"预览"查看详细信息。</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* 素材预览模态框 */}
      <Modal
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        title={selectedAsset?.name || '素材预览'}
        className="max-w-2xl"
      >
        {selectedAsset && (
          <div className="space-y-6">
            <div className="aspect-video bg-neutral-100 rounded-lg overflow-hidden">
              {selectedAsset.preview ? (
                <img
                  src={selectedAsset.preview}
                  alt={selectedAsset.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  无预览
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-neutral-900 mb-2">描述</h4>
              <p className="text-neutral-700">{selectedAsset.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-neutral-900 mb-2">分类</h4>
                <div className="text-neutral-700">
                  {ASSET_CATEGORIES.find(cat => cat.id === selectedAsset.category)?.name}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-2">类型</h4>
                <div className="text-neutral-700">
                  {selectedAsset.type === 'card' && '卡牌'}
                  {selectedAsset.type === 'prop' && '道具'}
                  {selectedAsset.type === 'deck' && '牌堆'}
                  {selectedAsset.type === 'background' && '背景'}
                  {selectedAsset.type === 'icon' && '图标'}
                </div>
              </div>
            </div>

            {selectedAsset.data && (
              <div>
                <h4 className="font-semibold text-neutral-900 mb-2">配置详情</h4>
                <pre className="bg-neutral-50 p-4 rounded-lg text-xs overflow-auto max-h-48">
                  {JSON.stringify(selectedAsset.data, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
              <Button variant="ghost" onClick={() => setSelectedAsset(null)}>
                关闭
              </Button>
              <Button variant="primary" onClick={() => handleApplyAsset(selectedAsset)}>
                <Download className="w-4 h-4 mr-2" />
                应用此素材
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}