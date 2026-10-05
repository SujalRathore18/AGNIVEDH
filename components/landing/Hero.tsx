'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Play, Terminal, ShieldCheck, Activity } from 'lucide-react'
import { BRANDING } from '@/lib/constants'
import { VedhMascot, VedhExpression } from '@/components/mascot/VedhMascot'
import { Button } from '@/components/ui/Button'
import { AskPanel } from '@/components/ask/AskPanel'

export const Hero: React.FC = () => {
  const [mascotExp, setMascotExp] = useState<VedhExpression>('idle')

  return (
    <section className="relative w-full pt-10 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Top Context Pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#09150E] border border-[#39FF14]/30 chamfer-sm text-xs font-mono text-[#39FF14] mb-6 shadow-[0_0_15px_rgba(57,255,20,0.15)]">
        <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
        <span>ISRO PS 26170 // SMART INDIA HACKATHON 2026 // TEAM GSR NEXUS</span>
      </div>

      {/* Main Headline & Mascot Row */}
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 mb-8 text-center lg:text-left">
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-white tracking-tight leading-[1.1]">
            Passing the limit is not the same as being <span className="text-[#39FF14] text-glow-green">healthy.</span>
          </h1>

          <p className="text-base sm:text-xl font-space font-semibold text-[#FF9F1C] tracking-wide">
            {BRANDING.tagline}
          </p>

          <p className="text-xs sm:text-sm text-muted font-space leading-relaxed max-w-2xl">
            Space chips are heated for a week so weak ones fail on the ground. AGNIVEDH finds the chip that looks fine but is quietly getting worse, forecasts where it is heading, and tells the inspector why.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <Link href="/dashboard">
              <Button size="lg" glow rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Inspector Console
              </Button>
            </Link>
            <a href="#ask-agnivedh-section">
              <Button variant="ghost" size="lg" leftIcon={<Terminal className="w-4 h-4 text-[#39FF14]" />}>
                Probe Telemetry
              </Button>
            </a>
          </div>
        </div>

        {/* Mascot Spotlight */}
        <div className="shrink-0 flex flex-col items-center relative">
          <div className="relative animate-float-slow">
            <VedhMascot expression={mascotExp} size={240} />
          </div>
          <div className="mt-2 text-center">
            <span className="text-xs font-heading font-bold text-white tracking-wider">
              VEDH
            </span>
            <span className="block text-[11px] font-mono text-[#39FF14]">
              ASTRONAUT FROG AI INSPECTOR
            </span>
          </div>
        </div>
      </div>

      {/* Ask AGNIVEDH Panel Anchor */}
      <div id="ask-agnivedh-section" className="w-full pt-4">
        <div className="text-center mb-2">
          <span className="text-xs font-mono text-[#39FF14] uppercase tracking-widest">
            INTERACTIVE REASONING CONSOLE
          </span>
        </div>
        <AskPanel onExpressionChange={(exp) => setMascotExp(exp)} />
      </div>
    </section>
  )
}
