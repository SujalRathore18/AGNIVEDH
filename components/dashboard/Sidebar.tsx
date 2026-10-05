'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Layers,
  Cpu,
  BarChart2,
  Sliders,
  Database,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { VedhMascot } from '@/components/mascot/VedhMascot'

export const Sidebar: React.FC = () => {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/batches', label: 'Batches', icon: Layers },
    { href: '/dashboard/parts', label: 'Parts Table', icon: Cpu },
    { href: '/dashboard/evaluation', label: 'Evaluation', icon: BarChart2 },
    { href: '/dashboard/models', label: 'Models & CV', icon: Sliders },
  ]

  return (
    <aside className="w-full lg:w-64 bg-[#080E0B] border-r border-surface-border p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Sidebar Mini Profile */}
        <div className="flex items-center gap-3 p-3 bg-black/40 border border-surface-border chamfer-sm">
          <div className="w-10 h-10 relative">
            <VedhMascot expression="idle" size={40} showGlow={false} showBadge={false} />
          </div>
          <div>
            <div className="text-xs font-heading font-bold text-white tracking-wider">
              VEDH // CONSOLE
            </div>
            <div className="text-[10px] font-mono text-[#39FF14]">
              QA INSPECTOR ACTIVE
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5" aria-label="Console Navigation">
          <span className="text-[10px] font-mono text-muted uppercase tracking-wider px-3 block mb-2">
            TELEMETRY MODULES
          </span>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 text-xs font-mono transition-all duration-200 chamfer-sm',
                  isActive
                    ? 'bg-[#14281E] text-[#39FF14] border border-[#39FF14]/50 shadow-[0_0_10px_rgba(57,255,20,0.2)] font-bold'
                    : 'text-muted hover:text-slate-200 hover:bg-white/5 border border-transparent'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-[#39FF14]' : 'text-muted')} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer Info in Sidebar */}
      <div className="mt-8 pt-4 border-t border-surface-border/50 text-[10px] font-space text-muted space-y-2">
        <div className="flex items-center gap-1.5 text-slate-300 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-[#39FF14]" />
          <span>ISRO PS 26170 Qualification</span>
        </div>
        <p className="text-muted-dark leading-tight">
          Ground-truth labels are isolated and never utilized during inference screening.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[#39FF14] hover:underline font-mono pt-1"
        >
          <span>Return to Mission Landing</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </aside>
  )
}
