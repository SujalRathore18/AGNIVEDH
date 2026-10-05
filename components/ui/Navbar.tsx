'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, ShieldCheck, Terminal, Menu, X, Cpu } from 'lucide-react'
import { BRANDING } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { VedhMascot } from '../mascot/VedhMascot'

export const Navbar: React.FC = () => {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isDashboard = pathname.startsWith('/dashboard')

  const navLinks = [
    { href: '/', label: 'MISSION' },
    { href: '/dashboard', label: 'INSPECTOR CONSOLE' },
    { href: '/dashboard/batches', label: 'BATCHES' },
    { href: '/dashboard/parts', label: 'PARTS' },
    { href: '/dashboard/evaluation', label: 'EVALUATION' },
  ]

  return (
    <>
      {/* Skip link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#39FF14] focus:text-[#05070A] focus:font-bold focus:chamfer-sm"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-[#05070A]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-9 h-9 relative">
              <VedhMascot expression="idle" size={36} showGlow={false} showBadge={false} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-lg tracking-wider text-white group-hover:text-[#39FF14] transition-colors">
                  {BRANDING.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/40 chamfer-sm">
                  ISRO PS 26170
                </span>
              </div>
              <span className="text-[10px] font-space text-muted tracking-tight hidden sm:inline">
                {BRANDING.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-xs" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3.5 py-2 transition-all duration-200 chamfer-sm font-medium tracking-wide',
                    active
                      ? 'bg-[#12231A] text-[#39FF14] border border-[#39FF14]/50 shadow-[0_0_8px_rgba(57,255,20,0.2)]'
                      : 'text-muted hover:text-slate-100 hover:bg-white/5 border border-transparent'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right Status Badge & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-[#09150E] border border-[#39FF14]/30 chamfer-sm text-[11px] font-mono text-[#39FF14]">
              <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
              <span>OFFLINE MOCK ACTIVE</span>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-muted hover:text-slate-100 border border-surface-border chamfer-sm"
              aria-label="Toggle navigation drawer"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-b border-surface-border bg-[#080E0B] px-4 pt-2 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-mono text-slate-200 hover:text-[#39FF14] hover:bg-[#12231A] chamfer-sm"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-surface-border flex items-center justify-between text-xs font-mono text-[#39FF14]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#39FF14]" />
                Offline Mode (Local Synthetic Engine)
              </span>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
