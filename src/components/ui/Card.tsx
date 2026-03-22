// src/components/ui/Card.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl bg-white border border-neutral-200/60',
        'shadow-sm backdrop-blur-sm',
        hover && 'transition-all duration-300 hover:shadow-md hover:border-neutral-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';