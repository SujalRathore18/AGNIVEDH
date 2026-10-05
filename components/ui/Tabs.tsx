'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
}

interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1.5 p-1 bg-[#080E0B] border border-surface-border chamfer-sm overflow-x-auto',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 text-xs font-mono transition-all duration-200 select-none chamfer-sm whitespace-nowrap cursor-pointer',
              isActive
                ? 'bg-[#152B1E] text-[#39FF14] border border-[#39FF14]/50 shadow-[0_0_8px_rgba(57,255,20,0.25)] font-bold'
                : 'text-muted hover:text-slate-200 hover:bg-white/5 border border-transparent'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                  isActive ? 'bg-[#39FF14] text-[#05070A]' : 'bg-surface-muted text-muted'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
