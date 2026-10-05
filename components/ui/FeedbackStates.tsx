'use client'

import React from 'react'
import { AlertOctagon, RefreshCw, FolderSearch } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-[#122018]/60 border border-surface-border/40 chamfer-sm',
        className
      )}
    />
  )
}

export interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'System Anomaly Detected',
  message,
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'border border-reject/40 bg-[#140808]/80 chamfer-md p-8 text-center flex flex-col items-center justify-center max-w-md mx-auto my-6',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-reject/10 border border-reject/40 flex items-center justify-center text-reject mb-4">
        <AlertOctagon className="w-6 h-6 animate-pulse" />
      </div>
      <h4 className="text-base font-heading font-bold text-white mb-2">{title}</h4>
      <p className="text-xs text-muted font-space leading-relaxed mb-5">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Re-initialize Probe
        </Button>
      )}
    </div>
  )
}

export interface EmptyStateProps {
  title?: string
  message: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Telemetry Records Found',
  message,
  actionLabel,
  onAction,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        'border border-surface-border bg-[#080E0B]/70 chamfer-md p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto my-6',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-white/5 border border-surface-border flex items-center justify-center text-muted mb-4">
        {icon || <FolderSearch className="w-6 h-6 text-muted" />}
      </div>
      <h4 className="text-base font-heading font-bold text-slate-100 mb-1.5">{title}</h4>
      <p className="text-xs text-muted font-space leading-relaxed mb-5">{message}</p>
      {actionLabel && onAction && (
        <Button variant="ghost" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  className?: string
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [visible, setVisible] = React.useState(false)

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 px-3 py-1.5 bg-[#0C1712] text-slate-200 border border-[#39FF14]/40 text-xs font-mono chamfer-sm whitespace-nowrap shadow-[0_0_12px_rgba(0,0,0,0.8)] pointer-events-none animate-in fade-in zoom-in-95 duration-150',
            className
          )}
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0C1712]" />
        </div>
      )}
    </div>
  )
}
