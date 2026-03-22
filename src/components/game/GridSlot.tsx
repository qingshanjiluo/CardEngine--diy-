// src/components/game/GridSlot.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { GameElement, GridSlot as GridSlotType } from '@/types';
import { Layers, Box, Square } from 'lucide-react';
import { getRuntime } from '@/lib/runtime';

interface GridSlotProps {
  slot: GridSlotType;
}

export function GridSlot({ slot }: GridSlotProps) {
  const {
    project,
    runtime,
    selectedElement,
    setSelectedElement,
    moveElementToSlot,
    triggerEvent
  } = useStore();

  const elementId = slot.elementId;
  const element = elementId
    ? project.elements.find(e => e.id === elementId)
    : null;

  const isSelected = selectedElement === elementId;
  const isEmpty = !element;
  const isPlaying = runtime.isPlaying;

  const handleClick = async () => {
    if (element) {
      setSelectedElement(element.id);
      
      // If game is playing, trigger element click event
      if (isPlaying) {
        const runtimeInstance = getRuntime();
        if (runtimeInstance) {
          await runtimeInstance.handleElementClick(element.id);
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('elementId');
    if (draggedId) {
      moveElementToSlot(draggedId, slot.index);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (element) {
      e.dataTransfer.setData('elementId', element.id);
    }
  };

  return (
    <motion.div
      layout
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      draggable={!!element}
      // @ts-ignore - HTML5 drag API vs Framer Motion drag API
      onDragStart={handleDragStart}
      className={cn(
        'aspect-square rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden',
        'flex items-center justify-center',
        // 根据slot状态设置样式
        slot.status === 'locked' && 'border-red-300 bg-red-50/50 cursor-not-allowed',
        slot.status === 'highlighted' && 'border-yellow-400 bg-yellow-50/70 shadow-lg',
        slot.status === 'unavailable' && 'border-neutral-300 bg-neutral-100/30 cursor-not-allowed opacity-50',
        slot.status === 'selected' && 'border-brand-500 bg-brand-50 shadow-md',
        // 默认状态
        !slot.status || slot.status === 'normal' ? (
          isEmpty
            ? 'border-dashed border-neutral-200 bg-neutral-50/50 hover:border-neutral-300 hover:bg-neutral-100/50'
            : isSelected
              ? 'border-brand-500 bg-brand-50 shadow-md'
              : 'border-neutral-200 bg-white shadow-sm hover:shadow-md hover:border-neutral-300'
        ) : ''
      )}
    >
      {element ? (
        <SlotContent element={element} />
      ) : (
        <span className="text-xs text-neutral-300 font-medium">{slot.index + 1}</span>
      )}
    </motion.div>
  );
}

function SlotContent({ element }: { element: GameElement }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2">
      {/* Element Image or Icon */}
      <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center mb-1 overflow-hidden">
        {element.image ? (
          <img 
            src={element.image} 
            alt={element.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            {element.type === 'card' && <Square className="w-5 h-5 text-brand-400" />}
            {element.type === 'prop' && <Box className="w-5 h-5 text-amber-400" />}
            {element.type === 'deck' && <Layers className="w-5 h-5 text-emerald-400" />}
          </>
        )}
      </div>

      {/* Element Name */}
      <span className="text-xs text-neutral-600 font-medium text-center truncate w-full">
        {element.name}
      </span>

      {/* Deck Count Badge */}
      {element.type === 'deck' && (
        <span className="absolute top-1 right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          0
        </span>
      )}

      {/* Face Indicator */}
      {element.type === 'card' && element.face === 'back' && (
        <div className="absolute inset-0 bg-neutral-800/10 flex items-center justify-center">
          <span className="text-xs text-neutral-500 font-medium">背面</span>
        </div>
      )}
    </div>
  );
}
