'use client'

import React from 'react'
import { Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SuggestionChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export const SuggestionChip: React.FC<SuggestionChipProps> = ({
  children,
  active = false,
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono transition-all duration-200 cursor-pointer select-none chamfer-sm',
        active
          ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.3)]'
          : 'bg-[#08100C] text-slate-300 border border-surface-border hover:border-[#39FF14]/50 hover:text-slate-100 hover:bg-[#0E1C15]',
        className
      )}
      {...props}
    >
      <Terminal className="w-3 h-3 text-[#39FF14]/70 shrink-0" />
      <span className="truncate">{children}</span>
    </button>
  )
}
