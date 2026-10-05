'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface StatTileProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  unit?: string
  subtext?: string
  icon?: React.ReactNode
  variant?: 'default' | 'green' | 'amber' | 'red' | 'cyan'
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  unit,
  subtext,
  icon,
  variant = 'default',
  className,
  ...props
}) => {
  const valueColor = {
    default: 'text-slate-100',
    green: 'text-[#39FF14]',
    amber: 'text-[#FF9F1C]',
    red: 'text-[#FF3B3B]',
    cyan: 'text-cyan-400',
  }[variant]

  const borderStyle = {
    default: 'border-surface-border hover:border-[#39FF14]/40',
    green: 'border-[#39FF14]/30 hover:border-[#39FF14] shadow-[0_0_12px_rgba(57,255,20,0.1)]',
    amber: 'border-amber/30 hover:border-amber shadow-[0_0_12px_rgba(255,159,28,0.1)]',
    red: 'border-reject/30 hover:border-reject shadow-[0_0_12px_rgba(255,59,59,0.1)]',
    cyan: 'border-cyan-500/30 hover:border-cyan-400',
  }[variant]

  return (
    <div
      className={cn(
        'bg-[#080E0B]/90 border chamfer-md p-5 transition-all duration-300 relative overflow-hidden',
        borderStyle,
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs uppercase font-space tracking-wider text-muted font-medium">
          {label}
        </span>
        {icon && <div className="text-muted/70">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className={cn('text-2xl sm:text-3xl font-heading font-bold tracking-tight', valueColor)}>
          {value}
        </span>
        {unit && <span className="text-xs font-mono text-muted">{unit}</span>}
      </div>

      {subtext && <p className="text-[11px] text-muted-dark font-space truncate mt-1">{subtext}</p>}
    </div>
  )
}
