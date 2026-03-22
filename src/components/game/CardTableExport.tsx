// src/components/game/CardTableExport.tsx
'use client';

import React, { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { 
  Download, 
  FileImage, 
  FileText, 
  Printer, 
  CheckCircle, 
  Loader2,
  AlertCircle,
  Grid,
  Columns,
  Settings
} from 'lucide-react';
import { toPng } from 'html-to-image';

interface CardTableExportProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'png' | 'print';

interface ExportOption {
  id: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const exportOptions: ExportOption[] = [
  {
    id: 'png',
    label: 'PNG 图片',
    description: '导出为高分辨率图片，适合分享和打印',
    icon: <FileImage className="w-5 h-5" />,
  },
  {
    id: 'print',
    label: '直接打印',
    description: '使用浏览器打印功能直接打印',
    icon: <Printer className="w-5 h-5" />,
  },
];

export function CardTableExport({ isOpen, onClose }: CardTableExportProps) {
  const { project } = useStore();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png');
  const [status, setStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const exportRef = useRef<HTMLDivElement>(null);

  // 获取所有卡牌元素
  const cardElements = project.elements.filter((e) => e.type === 'card');

  const handleExport = async () => {
    if (!exportRef.current) return;
    
    setStatus('exporting');
    setErrorMessage(null);

    try {
      switch (selectedFormat) {
        case 'png':
          await exportAsPng();
          break;
        case 'print':
          await exportAsPrint();
          break;
      }
      
      setStatus('success');
      
      // 延迟关闭
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 1500);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '导出失败');
    }
  };

  const exportAsPng = async () => {
    if (!exportRef.current) throw new Error('导出元素未找到');
    
    const dataUrl = await toPng(exportRef.current, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });

    const link = document.createElement('a');
    link.download = `${project.name}_卡牌表_${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataUrl;
    link.click();
  };

  const exportAsPrint = async () => {
    if (!exportRef.current) throw new Error('导出元素未找到');
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) throw new Error('无法打开打印窗口');
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${project.name} - 卡牌表</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .print-header { text-align: center; margin-bottom: 30px; }
          .print-header h1 { margin: 0; color: #333; }
          .print-header p { color: #666; margin: 5px 0; }
          .cards-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
          .card-item { border: 1px solid #ddd; border-radius: 8px; padding: 15px; break-inside: avoid; }
          .card-name { font-weight: bold; margin-bottom: 10px; color: #333; }
          .card-properties { font-size: 12px; color: #666; }
          .property-item { margin: 3px 0; }
          @media print {
            body { margin: 0; }
            .cards-container { grid-template-columns: repeat(3, 1fr); }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>${project.name}</h1>
          <p>卡牌表 - 共 ${cardElements.length} 张卡牌</p>
          <p>导出时间: ${new Date().toLocaleString()}</p>
        </div>
        <div class="cards-container">
          ${cardElements.map(card => `
            <div class="card-item">
              <div class="card-name">${card.name}</div>
              <div class="card-properties">
                ${Object.entries(card.properties || {}).map(([key, prop]) => `
                  <div class="property-item">
                    <strong>${prop.label}:</strong> ${prop.value}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const renderCardGrid = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {cardElements.map((card) => (
          <div
            key={card.id}
            className="w-40 h-56 rounded-lg border border-neutral-200 overflow-hidden shadow-sm flex flex-col"
            style={{ backgroundColor: card.color || '#667eea' }}
          >
            {/* 卡牌顶部 */}
            <div className="p-3 text-white text-center flex-1 flex flex-col items-center justify-center">
              {card.image && (
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-16 h-16 rounded-lg mb-2 object-cover"
                />
              )}
              <div className="font-bold text-sm mb-1">{card.name}</div>
              <div className="text-xs opacity-90">{card.cardType || '卡牌'}</div>
            </div>
            
            {/* 卡牌属性 */}
            {Object.keys(card.properties || {}).length > 0 && (
              <div className="bg-white/90 p-2 text-xs">
                {Object.entries(card.properties || {}).slice(0, 3).map(([key, prop]) => (
                  <div key={key} className="flex justify-between mb-1">
                    <span className="text-neutral-600">{prop.label}:</span>
                    <span className="font-semibold">{prop.value}</span>
                  </div>
                ))}
                {Object.keys(card.properties || {}).length > 3 && (
                  <div className="text-center text-neutral-500 text-xs">
                    +{Object.keys(card.properties || {}).length - 3} 更多属性
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="导出卡牌表"
      className="max-w-4xl"
    >
      <div className="space-y-6">
        {/* 导出选项 */}
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-2 block">
            选择导出格式
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exportOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedFormat(option.id)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                  selectedFormat === option.id
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  selectedFormat === option.id ? 'bg-brand-500 text-white' : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {option.icon}
                </div>
                <div>
                  <div className="font-medium text-neutral-900">{option.label}</div>
                  <div className="text-sm text-neutral-500 mt-1">{option.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 预览区域 */}
        <div>
          <div className="text-sm font-medium text-neutral-700 mb-3">预览 ({cardElements.length} 张卡牌)</div>
          <div 
            ref={exportRef}
            className="p-6 bg-white border border-neutral-200 rounded-lg max-h-96 overflow-auto"
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-neutral-900">{project.name}</h3>
              <p className="text-sm text-neutral-600">卡牌表 - 共 {cardElements.length} 张卡牌</p>
            </div>
            {renderCardGrid()}
          </div>
        </div>

        {/* 错误提示 */}
        {status === 'error' && errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={status === 'exporting'}
          >
            取消
          </Button>
          <Button
            onClick={handleExport}
            disabled={status === 'exporting' || status === 'success'}
            className="flex-1"
          >
            {status === 'exporting' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                导出中...
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                导出成功
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                导出
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
