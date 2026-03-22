// src/components/blocks/ExportDialog.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { exportProject, downloadFile } from '@/lib/export';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { 
  FileJson, 
  FileCode, 
  Image, 
  Download, 
  CheckCircle, 
  Loader2,
  AlertCircle
} from 'lucide-react';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'json' | 'html' | 'image-board';
type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

interface ExportOption {
  id: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
  extension: string;
  filename: string;
}

const exportOptions: ExportOption[] = [
  {
    id: 'json',
    label: 'JSON 项目文件',
    description: '导出完整的项目数据，包含卡牌、道具、规则和脚本',
    icon: <FileJson className="w-6 h-6" />,
    extension: 'json',
    filename: 'project'
  },
  {
    id: 'html',
    label: 'HTML 游戏文件',
    description: '导出可独立运行的 HTML 游戏文件',
    icon: <FileCode className="w-6 h-6" />,
    extension: 'html',
    filename: 'game'
  },
  {
    id: 'image-board',
    label: '面板截图',
    description: '导出游戏面板的图片（需要游戏面板可见）',
    icon: <Image className="w-6 h-6" />,
    extension: 'png',
    filename: 'board'
  }
];

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const { project, runtime, addLog } = useStore();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [includeRuntime, setIncludeRuntime] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExport = async () => {
    setStatus('exporting');
    setErrorMessage(null);

    try {
      const option = exportOptions.find(o => o.id === selectedFormat)!;
      
      const result = exportProject(project, runtime, {
        format: selectedFormat,
        includeRuntime: selectedFormat === 'json' ? includeRuntime : false
      });

      let blob: Blob;
      if (result instanceof Promise) {
        blob = await result;
      } else if (typeof result === 'string') {
        blob = new Blob([result], { 
          type: selectedFormat === 'json' ? 'application/json' : 'text/html'
        });
      } else {
        blob = result;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${project.name}_${option.filename}_${timestamp}.${option.extension}`;
      
      downloadFile(blob, filename);
      
      setStatus('success');
      addLog('info', `项目已导出为 ${option.label}`);

      // 延迟关闭
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 1500);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '导出失败');
      addLog('error', '项目导出失败');
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="导出项目">
      <div className="space-y-6">
        {/* 导出选项 */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-neutral-700">选择导出格式</label>
          <div className="space-y-2">
            {exportOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedFormat(option.id);
                  setStatus('idle');
                  setErrorMessage(null);
                }}
                className={`
                  w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left
                  ${selectedFormat === option.id
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }
                `}
              >
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                  ${selectedFormat === option.id ? 'bg-brand-500 text-white' : 'bg-neutral-100 text-neutral-500'}
                `}>
                  {option.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-neutral-900">{option.label}</div>
                  <div className="text-sm text-neutral-500 mt-0.5">{option.description}</div>
                </div>
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                  ${selectedFormat === option.id 
                    ? 'border-brand-500 bg-brand-500' 
                    : 'border-neutral-300'
                  }
                `}>
                  {selectedFormat === option.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* JSON 特有选项 */}
        {selectedFormat === 'json' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg"
          >
            <input
              type="checkbox"
              id="include-runtime"
              checked={includeRuntime}
              onChange={(e) => setIncludeRuntime(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-brand-500 focus:ring-brand-500"
            />
            <label htmlFor="include-runtime" className="text-sm text-neutral-700 cursor-pointer">
              包含游戏运行时状态（当前回合、玩家数据等）
            </label>
          </motion.div>
        )}

        {/* 错误提示 */}
        <AnimatePresence>
          {status === 'error' && errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={handleClose}
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
