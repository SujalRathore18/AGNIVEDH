'use client'

import React from 'react'
import { Lock, HardDrive, UserCheck, History, Shield } from 'lucide-react'

export const PrivacySection: React.FC = () => {
  const points = [
    {
      icon: HardDrive,
      title: '100% Air-Gapped Offline Operation',
      description: 'Runs entirely from local CSV exports or secure internal servers. No telemetry, wafer IDs, or test metrics ever leave your environment.',
    },
    {
      icon: Lock,
      title: 'Zero External LLM or Cloud Calls',
      description: 'The reasoning engine is deterministic TypeScript / Python physics math. No sensitive aerospace parameters are sent to public cloud endpoints.',
    },
    {
      icon: UserCheck,
      title: 'Human Stays in Command (Review Lane)',
      description: 'Statistical edge cases are quarantined into an explicit Review lane. No flight-bound component is auto-scrapped or auto-accepted without human QA sign-off.',
    },
    {
      icon: History,
      title: 'Immutable Audit Trail on Overrides',
      description: 'Every inspector override requires a mandatory justification note, timestamp, and operator credential, permanently linked to the lot export.',
    },
  ]

  return (
    <section className="w-full my-16 bg-[#080E0B] border border-surface-border chamfer-lg p-6 sm:p-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono text-[#39FF14] uppercase tracking-wider block mb-1">
            06 // DATA INTEGRITY &amp; MISSION SECURITY
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
            Built for High-Reliability Space Protocols
          </h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#12241B] border border-[#39FF14]/40 text-[#39FF14] text-xs font-mono chamfer-sm">
          <Shield className="w-4 h-4" /> AIR-GAP READY
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {points.map((p, idx) => {
          const Icon = p.icon
          return (
            <div key={idx} className="flex items-start gap-4 p-4 bg-black/40 border border-surface-border chamfer-sm">
              <div className="p-2.5 bg-[#122019] text-[#39FF14] border border-[#39FF14]/30 chamfer-sm shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-heading font-bold text-slate-100 mb-1">{p.title}</h4>
                <p className="text-xs text-muted font-space leading-relaxed">{p.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
