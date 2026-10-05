'use client'

import React from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Decision } from '@/lib/types'

export type BadgeType = Decision | 'LOW_CONFIDENCE' | 'EARLY_FAIL'

interface StatusBadgeProps {
  status: BadgeType
  size?: 'sm' | 'md'
  showIcon?: boolean
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const config = {
    ACCEPT: {
      label: 'ACCEPT',
      icon: CheckCircle2,
      style: 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/40 shadow-[0_0_8px_rgba(57,255,20,0.2)]',
    },
    REVIEW: {
      label: 'REVIEW',
      icon: AlertTriangle,
      style: 'bg-[#FF9F1C]/10 text-[#FF9F1C] border-[#FF9F1C]/40 shadow-[0_0_8px_rgba(255,159,28,0.2)]',
    },
    REJECT: {
      label: 'REJECT',
      icon: XCircle,
      style: 'bg-[#FF3B3B]/10 text-[#FF3B3B] border-[#FF3B3B]/40 shadow-[0_0_8px_rgba(255,59,59,0.2)]',
    },
    LOW_CONFIDENCE: {
      label: 'LOW CONFIDENCE',
      icon: Info,
      style: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]',
    },
    EARLY_FAIL: {
      label: 'EARLY FAIL',
      icon: Flame,
      style: 'bg-purple-500/10 text-purple-300 border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.2)]',
    },
  }[status]

  const Icon = config.icon
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5'

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-semibold uppercase tracking-wider border chamfer-sm select-none',
        sizeClasses,
        config.style,
        className
      )}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />}
      <span>{config.label}</span>
    </span>
  )
}
