'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Layers,
  Info,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  BarChart3,
  ExternalLink,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  Cell,
} from 'recharts'
import { useDashboard } from '@/components/dashboard/DashboardContext'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ClippedPanel } from '@/components/ui/ClippedPanel'
import { Skeleton } from '@/components/ui/FeedbackStates'
import { formatMicroAmps, formatPercent } from '@/lib/utils'

export default function BatchDetailPage() {
  const params = useParams()
  const batchId = (params?.id as string)?.toUpperCase()
  const { batches, parts, isLoading } = useDashboard()

  const batch = batches.find((b) => b.batch_id.toUpperCase() === batchId)
  const batchParts = useMemo(
    () => parts.filter((p) => p.batch_id.toUpperCase() === batchId),
    [parts, batchId]
  )

  if (isLoading || !batch) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  // Distribution data for Recharts histogram
  const histogramData = batch.distribution.bins.map((bin) => {
    const isOutlierBin = bin.max > batch.effective_limit_uA
    return {
      range: `${bin.min}-${bin.max}`,
      midpoint: (bin.min + bin.max) / 2,
      count: bin.count,
      isOutlier: isOutlierBin,
    }
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/batches"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-muted hover:text-[#39FF14] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Batches</span>
        </Link>
        <span className="text-xs font-mono text-muted">Lot ID: {batch.batch_id}</span>
      </div>

      {/* Batch Header Bar */}
      <div className="bg-[#080E0B] border border-surface-border chamfer-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-heading font-black text-white">
              BATCH {batch.batch_id}
            </h2>
            <StatusBadge status={batch.decision} size="md" />
            {batch.confidence === 'low' && (
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 chamfer-sm">
                LOW CONFIDENCE (POOLED)
              </span>
            )}
          </div>
          <p className="text-xs font-space text-muted">
            Part Type: <span className="text-slate-200 font-mono">{batch.part_type}</span> • Total Samples: <span className="text-slate-200 font-mono">{batch.total_parts}</span>
          </p>
        </div>

        {/* Action badge */}
        <div className="text-right font-mono text-xs text-muted">
          <div>Flagged Components: <span className="font-bold text-[#FF9F1C]">{batch.flagged_count}</span> ({formatPercent(batch.flagged_fraction * 100)})</div>
          <div>Log Spread (MAD): <span className="font-bold text-slate-200">{batch.distribution.log_spread}</span></div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#080E0B] border border-surface-border chamfer-md">
          <span className="text-[10px] font-mono text-muted uppercase block mb-1">Batch Median</span>
          <span className="text-xl font-heading font-bold text-white">{formatMicroAmps(batch.median_uA)}</span>
          <span className="text-[11px] font-space text-muted-dark block mt-1">ln(median) ≈ {Math.log(batch.median_uA).toFixed(2)}</span>
        </div>

        <div className="p-4 bg-[#080E0B] border border-amber/40 chamfer-md">
          <span className="text-[10px] font-mono text-muted uppercase block mb-1">Learned Limit (MAD)</span>
          <span className="text-xl font-heading font-bold text-[#FF9F1C]">{formatMicroAmps(batch.learned_limit_uA)}</span>
          <span className="text-[11px] font-space text-muted-dark block mt-1">Threshold: 4.5× MAD</span>
        </div>

        <div className="p-4 bg-[#080E0B] border border-reject/40 chamfer-md">
          <span className="text-[10px] font-mono text-muted uppercase block mb-1">Datasheet Ceiling</span>
          <span className="text-xl font-heading font-bold text-[#FF3B3B]">{formatMicroAmps(batch.datasheet_limit_uA)}</span>
          <span className="text-[11px] font-space text-muted-dark block mt-1">Static legal limit</span>
        </div>

        <div className="p-4 bg-[#080E0B] border border-[#39FF14]/40 chamfer-md">
          <span className="text-[10px] font-mono text-muted uppercase block mb-1">Effective Limit</span>
          <span className="text-xl font-heading font-bold text-[#39FF14]">{formatMicroAmps(batch.effective_limit_uA)}</span>
          <span className="text-[11px] font-space text-muted-dark block mt-1">min(Learned, Datasheet)</span>
        </div>
      </div>

      {/* Histogram on Log Axis with Reference Lines */}
      <ClippedPanel
        headerSlot={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#39FF14]" />
              <span className="text-xs font-heading font-bold text-white uppercase tracking-wider">
                Baseline Leakage Distribution (µA)
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted">
              Outliers Highlighted in Amber / Red
            </span>
          </div>
        }
      >
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} margin={{ top: 20, right: 30, left: -10, bottom: 25 }}>
              <XAxis
                dataKey="range"
                stroke="#8A94A6"
                fontSize={11}
                tickLine={false}
                tick={{ fill: '#8A94A6', fontFamily: 'monospace' }}
                label={{ value: 'Leakage Current Interval (µA)', position: 'insideBottom', offset: -15, fill: '#8A94A6', fontSize: 11 }}
              />
              <YAxis
                stroke="#8A94A6"
                fontSize={11}
                tickLine={false}
                allowDecimals={false}
                tick={{ fill: '#8A94A6', fontFamily: 'monospace' }}
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload
                    return (
                      <div className="bg-[#09120D] border border-surface-border p-2.5 text-xs font-mono chamfer-sm">
                        <div className="font-bold text-white">{d.range} µA</div>
                        <div className={d.isOutlier ? 'text-[#FF9F1C]' : 'text-[#39FF14]'}>
                          {d.count} components {d.isOutlier ? '(Flagged Outlier Range)' : ''}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {histogramData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isOutlier ? '#FF9F1C' : '#39FF14'}
                    fillOpacity={entry.isOutlier ? 0.9 : 0.75}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend notes */}
        <div className="mt-6 pt-3 border-t border-surface-border/50 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 bg-[#39FF14] rounded-sm" />
              Cohort Normal (&lt; Effective Limit)
            </span>
            <span className="flex items-center gap-1.5 text-[#FF9F1C]">
              <span className="w-2.5 h-2.5 bg-[#FF9F1C] rounded-sm" />
              Module A Latent Outliers
            </span>
          </div>
          <div className="text-muted text-[11px]">
            Formula: Effective Limit = min(exp(median + 4.5×1.4826×MAD), datasheet)
          </div>
        </div>
      </ClippedPanel>

      {/* Parts in Batch Table */}
      <ClippedPanel
        headerSlot={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-heading font-bold text-white uppercase tracking-wider">
              Components in Lot {batch.batch_id} ({batchParts.length})
            </span>
            <span className="text-[11px] font-mono text-[#39FF14]">
              Click any part to inspect full forecast trajectory
            </span>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-surface-border text-muted uppercase text-[10px]">
                <th className="py-2.5 px-3">Part ID</th>
                <th className="py-2.5 px-3">Decision</th>
                <th className="py-2.5 px-3">0h Leakage</th>
                <th className="py-2.5 px-3">24h Leakage</th>
                <th className="py-2.5 px-3">168h Forecast</th>
                <th className="py-2.5 px-3">MAD Score</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/40">
              {batchParts.map((p) => {
                const r0 = p.readings[0]?.current_uA
                const r24 = p.readings[1]?.current_uA
                const modALayer = p.reason_card.layers.find((l) => l.layer === 'batch_outlier')
                const score = modALayer?.score

                return (
                  <tr key={p.part_id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">
                      <Link href={`/dashboard/parts/${p.part_id}`} className="hover:text-[#39FF14] underline">
                        {p.part_id}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={p.decision} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-slate-200">{formatMicroAmps(r0)}</td>
                    <td className="py-2.5 px-3 text-slate-200">{formatMicroAmps(r24)}</td>
                    <td className="py-2.5 px-3 text-[#39FF14] font-bold">
                      {formatMicroAmps(p.predicted_168h_uA)}
                    </td>
                    <td className="py-2.5 px-3">
                      {score !== undefined ? (
                        <span className={score > 4.5 ? 'text-[#FF9F1C] font-bold' : 'text-muted'}>
                          {score.toFixed(1)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        href={`/dashboard/parts/${p.part_id}`}
                        className="text-[#39FF14] hover:underline inline-flex items-center gap-1 text-[11px]"
                      >
                        Inspect <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </ClippedPanel>
    </div>
  )
}
