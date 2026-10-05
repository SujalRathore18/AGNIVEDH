'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface ClippedPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'amber' | 'reject' | 'glass'
  glow?: boolean
  chamferSize?: 'sm' | 'md' | 'lg'
  headerSlot?: React.ReactNode
  footerSlot?: React.ReactNode
}

export const ClippedPanel: React.FC<ClippedPanelProps> = ({
  children,
  className,
  variant = 'default',
  glow = false,
  chamferSize = 'md',
  headerSlot,
  footerSlot,
  ...props
}) => {
  const chamferClass = {
    sm: 'chamfer-sm',
    md: 'chamfer-md',
    lg: 'chamfer-lg',
  }[chamferSize]

  const borderStyles = {
    default: 'border-surface-border hover:border-[#39FF14]/40',
    amber: 'border-amber/40 hover:border-amber/70',
    reject: 'border-reject/40 hover:border-reject/70',
    glass: 'border-white/10 backdrop-blur-md',
  }[variant]

  const glowStyles = glow
    ? {
        default: 'shadow-[0_0_24px_rgba(57,255,20,0.15)]',
        amber: 'shadow-[0_0_24px_rgba(255,159,28,0.2)]',
        reject: 'shadow-[0_0_24px_rgba(255,59,59,0.2)]',
        glass: 'shadow-[0_0_20px_rgba(0,0,0,0.5)]',
      }[variant]
    : ''

  return (
    <div
      className={cn(
        'relative bg-[#090F0C]/90 text-slate-100 border transition-all duration-300',
        chamferClass,
        borderStyles,
        glowStyles,
        className
      )}
      {...props}
    >
      {/* Sci-fi corner brackets */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#39FF14]/30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#39FF14]/30 pointer-events-none" />

      {headerSlot && (
        <div className="px-5 py-3 border-b border-surface-border flex items-center justify-between bg-black/30">
          {headerSlot}
        </div>
      )}

      <div className="p-5">{children}</div>

      {footerSlot && (
        <div className="px-5 py-3 border-t border-surface-border bg-black/40">
          {footerSlot}
        </div>
      )}
    </div>
  )
}
