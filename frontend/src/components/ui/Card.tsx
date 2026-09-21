import React from 'react';
import { cn } from '../../lib/utils';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className, children, ...props
}) => (
  <div
    className={cn(
      'rounded-2xl overflow-hidden transition-all duration-300',
      'bg-white/80 border border-pink-baby/20 shadow-pink-sm',
      'hover:shadow-pink-md hover:-translate-y-0.5',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className, children, ...props
}) => (
  <div
    className={cn(
      'px-6 py-4 flex items-center justify-between',
      'border-b border-pink-baby/12',
      className
    )}
    style={{ background: 'linear-gradient(to right, rgba(255,192,203,0.04), transparent)' }}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className, children, ...props
}) => (
  <h3
    className={cn('text-sm font-bold text-coal tracking-tight', className)}
    {...props}
  >
    {children}
  </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className, children, ...props
}) => (
  <div className={cn('p-6', className)} {...props}>
    {children}
  </div>
);
