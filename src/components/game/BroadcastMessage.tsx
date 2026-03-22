// src/components/game/BroadcastMessage.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Megaphone } from 'lucide-react';

export function BroadcastMessage() {
  const { runtime } = useStore();
  const [visibleMessages, setVisibleMessages] = useState<Array<{
    id: number;
    type: 'info' | 'error' | 'broadcast';
    message: string;
    timestamp: number;
  }>>([]);

  // 监听新的广播消息
  useEffect(() => {
    const logs = runtime.logs;
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      if (lastLog.type === 'broadcast') {
        const newMessage = {
          id: Date.now(),
          type: lastLog.type,
          message: lastLog.message,
          timestamp: lastLog.timestamp
        };
        
        setVisibleMessages(prev => [...prev, newMessage]);
        
        // 5秒后自动移除
        setTimeout(() => {
          setVisibleMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
        }, 5000);
      }
    }
  }, [runtime.logs]);

  if (visibleMessages.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {visibleMessages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, type: 'spring' }}
            className={cn(
              'rounded-xl border shadow-lg p-4 backdrop-blur-sm',
              msg.type === 'broadcast' 
                ? 'bg-blue-50/90 border-blue-200 text-blue-800' 
                : msg.type === 'error'
                ? 'bg-red-50/90 border-red-200 text-red-800'
                : 'bg-neutral-50/90 border-neutral-200 text-neutral-800'
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                msg.type === 'broadcast' 
                  ? 'bg-blue-100 text-blue-600' 
                  : msg.type === 'error'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-neutral-100 text-neutral-600'
              )}>
                <Megaphone className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {msg.type === 'broadcast' ? '广播消息' : 
                   msg.type === 'error' ? '错误' : '信息'}
                </p>
                <p className="text-sm mt-1">{msg.message}</p>
                <p className="text-xs opacity-60 mt-2">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
