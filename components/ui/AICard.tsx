'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AICardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  badgeText?: string
  icon?: React.ReactNode
}

export const AICard: React.FC<AICardProps> = ({
  title,
  subtitle,
  badgeText = 'AI EXPLANATION',
  icon,
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative bg-gradient-to-b from-[#0B1712] to-[#070D0A] border border-[#39FF14]/30 rounded-none chamfer-md p-5 transition-all duration-300 shadow-[0_0_20px_rgba(57,255,20,0.1)] hover:border-[#39FF14]/60',
        className
      )}
      {...props}
    >
      {/* Top Header Tag */}
      {(title || badgeText) && (
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-[#39FF14]/10 rounded border border-[#39FF14]/40 text-[#39FF14]">
              {icon || <Sparkles className="w-4 h-4" />}
            </span>
            <div>
              {title && <h4 className="text-sm font-heading font-semibold text-slate-100">{title}</h4>}
              {subtitle && <p className="text-xs text-muted font-space">{subtitle}</p>}
            </div>
          </div>
          {badgeText && (
            <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 chamfer-sm">
              {badgeText}
            </span>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}
