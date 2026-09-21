import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const base = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none overflow-hidden active:scale-[0.97]';

  const variants: Record<string, string> = {
    primary: 'bg-coal text-white hover:bg-[#1a1a1a] shadow-coal-sm hover:shadow-coal-md',
    secondary: 'bg-amber-500 hover:bg-amber-400 text-white shadow-sm',
    outline: 'border border-pink-baby/50 bg-white/70 hover:bg-pink-baby/10 text-coal',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-sm',
    ghost: 'hover:bg-pink-baby/12 text-coal',
    pink: 'bg-pink-baby text-coal hover:bg-pink-soft shadow-pink-sm hover:shadow-pink-md font-bold',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Shimmer on primary */}
      {variant === 'primary' && (
        <span className="absolute inset-0 shimmer-bg opacity-0 hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
      )}

      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  );
};
