// src/components/ui/ContextMenu.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ContextMenuItem {
  id: string;
  label?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
  divider?: boolean;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
  className?: string;
}

export function ContextMenu({ items, position, onClose, className }: ContextMenuProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClick = useCallback((item: ContextMenuItem) => {
    if (item.onClick && !item.disabled) {
      item.onClick();
      onClose();
    }
  }, [onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // 确保菜单位置在视口内
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
  const menuWidth = 200;
  const menuHeight = items.length * 40 + 16;

  const adjustedX = Math.min(position.x, viewportWidth - menuWidth - 10);
  const adjustedY = Math.min(position.y, viewportHeight - menuHeight - 10);

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={handleBackdropClick}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />

      {/* 菜单 */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'fixed z-50 min-w-[200px] bg-white rounded-xl border border-neutral-200 shadow-xl overflow-hidden',
              className
            )}
            style={{
              left: adjustedX,
              top: adjustedY,
            }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="py-2">
              {items.map((item, index) => (
                <React.Fragment key={item.id}>
                  {item.divider ? (
                    <div className="h-px bg-neutral-100 my-1" />
                  ) : (
                    <button
                      onClick={() => handleClick(item)}
                      disabled={item.disabled}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                        'hover:bg-neutral-50 active:bg-neutral-100',
                        'disabled:opacity-40 disabled:cursor-not-allowed',
                        item.danger 
                          ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                          : 'text-neutral-700'
                      )}
                    >
                      {item.icon && (
                        <span className="w-4 h-4 flex items-center justify-center">
                          {item.icon}
                        </span>
                      )}
                      <span className="flex-1 text-left">{item.label}</span>
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// 长按菜单钩子
export function useLongPress(
  onLongPress: () => void,
  onClick?: () => void,
  options = { delay: 500 }
) {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  const start = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsLongPress(false);
    
    const timeout = setTimeout(() => {
      setIsLongPress(true);
      onLongPress();
    }, options.delay);
    
    setTimer(timeout);
  }, [onLongPress, options.delay]);

  const clear = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
    
    if (!isLongPress && onClick) {
      onClick();
    }
    
    setIsLongPress(false);
  }, [timer, isLongPress, onClick]);

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clear,
    onTouchEnd: clear,
    onMouseLeave: clear,
  };
}