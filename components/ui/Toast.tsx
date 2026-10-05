'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  title?: string
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, title?: string) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    setToasts((prev) => [...prev, { id, type, message, title }])

    // Auto dismiss after 4.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const config = {
            success: {
              icon: CheckCircle2,
              style: 'border-[#39FF14]/50 bg-[#09150E] text-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.25)]',
            },
            error: {
              icon: AlertCircle,
              style: 'border-reject/50 bg-[#160909] text-white shadow-[0_0_15px_rgba(255,59,59,0.25)]',
            },
            warning: {
              icon: AlertCircle,
              style: 'border-amber/50 bg-[#171008] text-[#FF9F1C] shadow-[0_0_15px_rgba(255,159,28,0.25)]',
            },
            info: {
              icon: Info,
              style: 'border-cyan-500/50 bg-[#081318] text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]',
            },
          }[toast.type]

          const Icon = config.icon

          return (
            <div
              key={toast.id}
              role="alert"
              className={cn(
                'pointer-events-auto border p-4 chamfer-md flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-5',
                config.style
              )}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                {toast.title && <div className="font-heading font-bold mb-0.5">{toast.title}</div>}
                <div className="text-slate-200 font-space leading-relaxed">{toast.message}</div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-muted hover:text-white p-0.5"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
