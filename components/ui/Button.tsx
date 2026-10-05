'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'amber'
  size?: 'sm' | 'md' | 'lg'
  chamfer?: boolean
  glow?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      chamfer = true,
      glow = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
    }[size]

    const chamferClass = chamfer ? (size === 'lg' ? 'chamfer-md' : 'chamfer-sm') : 'rounded'

    const variantStyles = {
      primary:
        'bg-[#39FF14] text-[#05070A] font-bold hover:bg-[#48ff26] active:scale-[0.98] shadow-[0_0_12px_rgba(57,255,20,0.3)] hover:shadow-[0_0_20px_rgba(57,255,20,0.5)]',
      ghost:
        'bg-surface-muted/60 text-slate-200 border border-surface-border hover:border-[#39FF14]/60 hover:text-[#39FF14] hover:bg-surface-muted/90',
      amber:
        'bg-[#FF9F1C] text-[#05070A] font-bold hover:bg-[#ffa933] shadow-[0_0_12px_rgba(255,159,28,0.3)] hover:shadow-[0_0_20px_rgba(255,159,28,0.5)]',
      danger:
        'bg-[#FF3B3B] text-white font-bold hover:bg-[#ff5252] shadow-[0_0_12px_rgba(255,59,59,0.3)] hover:shadow-[0_0_20px_rgba(255,59,59,0.5)]',
    }[variant]

    const glowStyle = glow ? 'shadow-[0_0_25px_rgba(57,255,20,0.6)]' : ''

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, sizeStyles, chamferClass, variantStyles, glowStyle, className)}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!loading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'
