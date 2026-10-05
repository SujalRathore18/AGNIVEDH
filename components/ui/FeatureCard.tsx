'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  stepNumber?: string | number
  title: string
  description: string
  icon?: React.ReactNode
  tag?: string
  variant?: 'default' | 'primary' | 'amber'
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  stepNumber,
  title,
  description,
  icon,
  tag,
  variant = 'default',
  className,
  children,
  ...props
}) => {
  const borderStyle = {
    default: 'border-surface-border hover:border-[#39FF14]/50',
    primary: 'border-[#39FF14]/40 hover:border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.15)]',
    amber: 'border-amber/40 hover:border-amber shadow-[0_0_15px_rgba(255,159,28,0.15)]',
  }[variant]

  return (
    <div
      className={cn(
        'group relative bg-[#080E0B]/85 border chamfer-md p-6 transition-all duration-300 flex flex-col justify-between',
        borderStyle,
        className
      )}
      {...props}
    >
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {stepNumber && (
              <span className="font-heading font-bold text-xs px-2 py-1 bg-[#13241C] text-[#39FF14] border border-[#39FF14]/30 chamfer-sm">
                {stepNumber}
              </span>
            )}
            {icon && (
              <div className="p-2 bg-[#122019] text-[#39FF14] rounded chamfer-sm border border-surface-border group-hover:scale-105 transition-transform">
                {icon}
              </div>
            )}
          </div>
          {tag && (
            <span className="text-[11px] font-mono uppercase px-2 py-0.5 bg-black/40 text-muted border border-surface-border chamfer-sm">
              {tag}
            </span>
          )}
        </div>

        <h3 className="text-base font-heading font-bold text-slate-100 mb-2 group-hover:text-[#39FF14] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-muted leading-relaxed font-space">{description}</p>
      </div>

      {children && <div className="mt-4 pt-4 border-t border-surface-border">{children}</div>}
    </div>
  )
}
