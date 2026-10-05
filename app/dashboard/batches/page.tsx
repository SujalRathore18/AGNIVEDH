'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Layers, ArrowRight, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useDashboard } from '@/components/dashboard/DashboardContext'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ClippedPanel } from '@/components/ui/ClippedPanel'
import { Skeleton } from '@/components/ui/FeedbackStates'
import { formatMicroAmps, formatPercent } from '@/lib/utils'

export default function BatchesListPage() {
  const { batches, isLoading } = useDashboard()
  const [filterDecision, setFilterDecision] = useState<'ALL' | 'ACCEPT' | 'REVIEW' | 'REJECT'>('ALL')

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      </div>
    )
  }

  const filteredBatches = batches.filter(
    (b) => filterDecision === 'ALL' || b.decision === filterDecision
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-[#39FF14]" />
            Component Burn-in Lots &amp; Batches
          </h2>
          <p className="text-xs text-muted font-space">
            Statistical distribution, MAD learned limits, and lot acceptance gate status.
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 p-1 bg-[#080E0B] border border-surface-border chamfer-sm font-mono text-xs">
          {(['ALL', 'ACCEPT', 'REVIEW', 'REJECT'] as const).map((dec) => (
            <button
              key={dec}
              onClick={() => setFilterDecision(dec)}
              className={`px-3 py-1.5 chamfer-sm transition-colors cursor-pointer ${
                filterDecision === dec
                  ? 'bg-[#152B1E] text-[#39FF14] font-bold border border-[#39FF14]/40'
                  : 'text-muted hover:text-white'
              }`}
            >
              {dec}
            </button>
          ))}
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredBatches.map((batch) => {
          const isLowConf = batch.confidence === 'low'
          return (
            <ClippedPanel
              key={batch.batch_id}
              className="hover:border-[#39FF14]/50 transition-all duration-200"
              headerSlot={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-black text-sm text-white">
                      {batch.batch_id}
                    </span>
                    <span className="text-[11px] font-mono text-muted">
                      ({batch.part_type})
                    </span>
                    {isLowConf && (
                      <span className="text-[10px] font-mono font-bold px-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 chamfer-sm">
                        LOW CONFIDENCE
                      </span>
                    )}
                  </div>
                  <StatusBadge status={batch.decision} size="sm" />
                </div>
              }
              footerSlot={
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted">
                    {batch.total_parts} Parts Total
                  </span>
                  <Link
                    href={`/dashboard/batches/${batch.batch_id}`}
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#39FF14] hover:underline"
                  >
                    <span>Inspect Log-Axis Histogram</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              }
            >
              <div className="space-y-4">
                {/* 4 Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-black/40 p-3 chamfer-sm">
                  <div>
                    <span className="text-[10px] text-muted uppercase block">Median</span>
                    <span className="text-white font-bold">{formatMicroAmps(batch.median_uA)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted uppercase block">Learned Limit</span>
                    <span className="text-[#FF9F1C] font-bold">{formatMicroAmps(batch.learned_limit_uA)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted uppercase block">Datasheet</span>
                    <span className="text-reject font-bold">{formatMicroAmps(batch.datasheet_limit_uA)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted uppercase block">Effective</span>
                    <span className="text-[#39FF14] font-bold">{formatMicroAmps(batch.effective_limit_uA)}</span>
                  </div>
                </div>

                {/* Reasons List */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-muted uppercase block">Qualification Reasons:</span>
                  <ul className="space-y-1">
                    {batch.reasons.map((r, rIdx) => (
                      <li key={rIdx} className="text-xs text-slate-300 font-space flex items-start gap-1.5">
                        <span className="text-[#39FF14]">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ClippedPanel>
          )
        })}
      </div>
    </div>
  )
}
