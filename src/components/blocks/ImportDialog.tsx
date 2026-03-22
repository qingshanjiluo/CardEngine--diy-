// src/components/blocks/ImportDialog.tsx
'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { importProject, readFileAsText, validateImportFile } from '@/lib/export';
import { Modal } from '@/components/ui/Modal';
import { Upload, FileJson, AlertCircle, CheckCircle, X } from 'lucide-react';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportDialog({ isOpen, onClose }: ImportDialogProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setProject, addLog } = useStore();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    setError(null);
    setSuccess(false);
    setFileName(file.name);

    // 验证文件
    if (!validateImportFile(file)) {
      setError('无效的文件。请上传 JSON 文件（最大 10MB）');
      return;
    }

    try {
      const content = await readFileAsText(file);
      const { project } = importProject(content);

      // 导入项目
      setProject(project);
      addLog('info', `项目 "${project.name}" 导入成功`);
      setSuccess(true);

      // 延迟关闭对话框
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFileName(null);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败');
      addLog('error', '项目导入失败');
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="导入项目">
      <div className="space-y-4">
        {/* 拖拽区域 */}
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center transition-all
            ${dragActive 
              ? 'border-brand-500 bg-brand-50' 
              : 'border-neutral-300 hover:border-neutral-400'
            }
            ${error ? 'border-red-300 bg-red-50' : ''}
            ${success ? 'border-green-300 bg-green-50' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleChange}
            className="hidden"
          />

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-green-700 font-medium">导入成功！</p>
              </motion.div>
            ) : fileName ? (
              <motion.div
                key="file"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <FileJson className="w-12 h-12 text-brand-500" />
                <p className="text-neutral-700 font-medium">{fileName}</p>
                <p className="text-neutral-500 text-sm">点击或拖拽更换文件</p>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 cursor-pointer"
              >
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center transition-colors
                  ${dragActive ? 'bg-brand-100' : 'bg-neutral-100'}
                `}>
                  <Upload className={`
                    w-8 h-8 transition-colors
                    ${dragActive ? 'text-brand-600' : 'text-neutral-400'}
                  `} />
                </div>
                <div>
                  <p className="text-neutral-700 font-medium">
                    点击或拖拽 JSON 文件到此处
                  </p>
                  <p className="text-neutral-500 text-sm mt-1">
                    支持 .json 格式，最大 10MB
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 错误提示 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 说明 */}
        <div className="text-xs text-neutral-500 space-y-1">
          <p>• 导入的项目将替换当前项目</p>
          <p>• 建议在导入前导出备份当前项目</p>
          <p>• 仅支持 CardEngine 导出的 JSON 文件</p>
        </div>
      </div>
    </Modal>
  );
}
