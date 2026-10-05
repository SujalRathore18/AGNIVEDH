'use client'

import React from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  Layers,
  Flame,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useDashboard } from '@/components/dashboard/DashboardContext'
import { StatTile } from '@/components/ui/StatTile'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ClippedPanel } from '@/components/ui/ClippedPanel'
import { Skeleton } from '@/components/ui/FeedbackStates'
import { formatPercent, formatMicroAmps } from '@/lib/utils'

export default function DashboardOverviewPage() {
  const { summary, batches, isLoading } = useDashboard()

  if (isLoading || !summary) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
        <Skeleton className="h-60" />
      </div>
    )
  }

  // Bar chart data for layer catches
  const layerCatchData = [
    { name: 'Static (L1)', count: summary.layer_catch.static_count, fill: '#FF3B3B' },
    { name: 'Module A (L2)', count: summary.layer_catch.module_a_count, fill: '#FF9F1C' },
    { name: 'Module B (L3)', count: summary.layer_catch.module_b_count, fill: '#39FF14' },
    { name: 'All Unique Flags', count: summary.layer_catch.all_combined, fill: '#00E5FF' },
  ]

  // Donut chart data
  const donutData = [
    { name: 'ACCEPT', value: summary.accept_count, color: '#39FF14' },
    { name: 'REVIEW', value: summary.review_count, color: '#FF9F1C' },
    { name: 'REJECT', value: summary.reject_count, color: '#FF3B3B' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Stat Tiles: Total parts, Accept, Review, Reject, Early-fail set aside */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatTile
          label="Total Parts"
          value={summary.total_parts}
          subtext={`${summary.total_batches} qualification lots`}
          icon={<Cpu className="w-5 h-5 text-muted" />}
          variant="default"
        />

        <StatTile
          label="Accepted"
          value={summary.accept_count}
          subtext={`${formatPercent((summary.accept_count / Math.max(1, summary.total_parts)) * 100)} lot pass rate`}
          icon={<CheckCircle2 className="w-5 h-5 text-[#39FF14]" />}
          variant="green"
        />

        <StatTile
          label="Review Lane"
          value={summary.review_count}
          subtext="Requires inspector note"
          icon={<AlertTriangle className="w-5 h-5 text-[#FF9F1C]" />}
          variant="amber"
        />

        <StatTile
          label="Rejected"
          value={summary.reject_count}
          subtext="Static or multi-layer fail"
          icon={<XCircle className="w-5 h-5 text-[#FF3B3B]" />}
          variant="red"
        />

        <StatTile
          label="Early-Fail Set Aside"
          value={summary.early_fail_count}
          subtext="Pre-stabilization short"
          icon={<Flame className="w-5 h-5 text-purple-400" />}
          variant="default"
        />
      </div>

      {/* 2. Charts Row: Layer Catch Bar Chart + Decision Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Layer Catch Bar Chart */}
        <ClippedPanel
          className="lg:col-span-7"
          headerSlot={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-200">
                Multi-Layer Anomaly Detection
              </span>
              <span className="text-[11px] font-mono text-[#39FF14]">
                {summary.layer_catch.all_combined} Total Flagged
              </span>
            </div>
          }
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={layerCatchData} margin={{ top: 15, right: 15, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  stroke="#8A94A6"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  tick={{ fill: '#8A94A6', fontFamily: 'monospace' }}
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
                      const data = payload[0].payload
                      return (
                        <div className="bg-[#09120D] border border-surface-border p-2.5 text-xs font-mono chamfer-sm">
                          <div className="font-bold text-white">{data.name}</div>
                          <div className="text-[#39FF14]">{data.count} components flagged</div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {layerCatchData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-[11px] font-mono text-muted flex justify-between items-center px-2">
            <span>Static = Absolute Limit</span>
            <span>Mod A = Batch Outlier (MAD)</span>
            <span>Mod B = 168h Drift</span>
          </div>
        </ClippedPanel>

        {/* Decision Donut */}
        <ClippedPanel
          className="lg:col-span-5"
          headerSlot={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-200">
                Decision Distribution
              </span>
              <span className="text-[11px] font-mono text-muted">
                {summary.total_parts} evaluated
              </span>
            </div>
          }
        >
          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#05070A" strokeWidth={2} />
                  ))}
                </Pie>
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload
                      return (
                        <div className="bg-[#09120D] border border-surface-border p-2 text-xs font-mono chamfer-sm">
                          <div className="font-bold text-white">{d.name}</div>
                          <div className="text-slate-300">{d.value} parts ({formatPercent((d.value / summary.total_parts) * 100)})</div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-heading font-black text-white">{summary.total_parts}</span>
              <span className="text-[10px] font-mono text-muted">TOTAL PARTS</span>
            </div>
          </div>

          <div className="flex items-center justify-around pt-3 border-t border-surface-border text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#39FF14]" />
              <span className="text-slate-300">Accept ({summary.accept_count})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF9F1C]" />
              <span className="text-slate-300">Review ({summary.review_count})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B3B]" />
              <span className="text-slate-300">Reject ({summary.reject_count})</span>
            </div>
          </div>
        </ClippedPanel>
      </div>

      {/* 3. Batch Decision Grid (Each batch a tile colored by Accept/Review/Reject with low-confidence tag) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#39FF14]" />
              Batch Decision Grid
            </h3>
            <p className="text-xs text-muted font-space">
              Holistic qualification triage across active wafer lots.
            </p>
          </div>
          <Link
            href="/dashboard/batches"
            className="text-xs font-mono text-[#39FF14] hover:underline flex items-center gap-1"
          >
            <span>View All Batches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => {
            const isLowConf = batch.confidence === 'low'
            const borderCol = {
              ACCEPT: 'border-[#39FF14]/40 hover:border-[#39FF14]',
              REVIEW: 'border-amber/50 hover:border-amber',
              REJECT: 'border-reject/50 hover:border-reject',
            }[batch.decision]

            return (
              <Link
                key={batch.batch_id}
                href={`/dashboard/batches/${batch.batch_id}`}
                className={`block bg-[#080E0B] border chamfer-md p-5 transition-all duration-200 hover:-translate-y-0.5 group ${borderCol}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-black text-sm text-white group-hover:text-[#39FF14] transition-colors">
                      {batch.batch_id}
                    </span>
                    {isLowConf && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 chamfer-sm">
                        LOW CONFIDENCE
                      </span>
                    )}
                  </div>
                  <StatusBadge status={batch.decision} size="sm" />
                </div>

                <div className="text-xs text-muted font-mono mb-4 truncate">
                  Type: {batch.part_type} (n={batch.total_parts})
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-black/40 p-2.5 chamfer-sm mb-3">
                  <div>
                    <span className="text-[10px] text-muted block">Batch Median:</span>
                    <span className="text-slate-200 font-bold">{formatMicroAmps(batch.median_uA)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block">Effective Limit:</span>
                    <span className="text-[#FF9F1C] font-bold">{formatMicroAmps(batch.effective_limit_uA)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block">Flagged Parts:</span>
                    <span className="text-slate-200 font-bold">
                      {batch.flagged_count} ({formatPercent(batch.flagged_fraction * 100)})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block">MAD Spread:</span>
                    <span className="text-slate-200 font-bold">{batch.distribution.log_spread}</span>
                  </div>
                </div>

                <div className="text-[11px] text-muted-dark font-space line-clamp-2">
                  {batch.reasons[0] || 'Nominal lot distribution.'}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
