'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs uppercase font-space text-muted tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-muted pointer-events-none">{leftIcon}</span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full bg-[#080E0B] text-slate-100 placeholder-muted-dark border border-surface-border text-sm px-4 py-2.5 transition-all duration-200 chamfer-sm',
              'focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/50 focus:shadow-[0_0_12px_rgba(57,255,20,0.25)]',
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              error ? 'border-reject ring-reject/40' : '',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 text-muted">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-xs text-reject font-mono mt-1">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs uppercase font-space text-muted tracking-wider">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            'w-full bg-[#080E0B] text-slate-100 placeholder-muted-dark border border-surface-border text-sm px-4 py-3 transition-all duration-200 chamfer-sm min-h-[90px]',
            'focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/50 focus:shadow-[0_0_12px_rgba(57,255,20,0.25)]',
            error ? 'border-reject' : '',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-reject font-mono mt-1">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
