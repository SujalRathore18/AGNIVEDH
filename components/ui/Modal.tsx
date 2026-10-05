'use client'

import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  className,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // Esc key listener & focus trap
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    // Focus modal
    modalRef.current?.focus()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative w-full bg-[#080E0B] border border-surface-border chamfer-lg shadow-[0_0_40px_rgba(0,0,0,0.9)] overflow-hidden',
          maxWidthClass,
          className
        )}
      >
        {/* Glowing top line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#39FF14] to-transparent" />

        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-surface-border">
          <div>
            {title && (
              <h3 id="modal-title" className="text-base font-heading font-bold text-slate-100">
                {title}
              </h3>
            )}
            {description && (
              <p id="modal-description" className="text-xs text-muted font-space mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-muted hover:text-slate-100 hover:bg-white/5 rounded chamfer-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
