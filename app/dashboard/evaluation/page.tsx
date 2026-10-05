'use client'

import React from 'react'
import {
  BarChart2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Cpu,
  Target,
  FileSpreadsheet,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
} from 'recharts'
import { useDashboard } from '@/components/dashboard/DashboardContext'
import { StatTile } from '@/components/ui/StatTile'
import { ClippedPanel } from '@/components/ui/ClippedPanel'
import { HonestLimitsBanner } from '@/components/landing/HonestLimitsBanner'
import { Skeleton } from '@/components/ui/FeedbackStates'
import { formatPercent, formatMicroAmps } from '@/lib/utils'

export default function EvaluationPage() {
  const { evaluation, isLoading } = useDashboard()

  if (isLoading || !evaluation) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    )
  }

  // Defect breakdown bar chart data
  const defectChartData = evaluation.defect_breakdown.map((item) => {
    const formattedName =
      item.defect_type === 'high_from_start'
        ? 'High Initial (4.5x)'
        : item.defect_type === 'jump_first_24h'
        ? '24h Jump'
        : item.defect_type === 'faster_creep'
        ? 'Fast Creep'
        : 'Early Fail'

    return {
      name: formattedName,
      injected: item.total_injected,
      detected: item.detected_count,
      recall: item.recall_pct,
    }
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Honest Limits Engineering Banner (Mandatory) */}
      <HonestLimitsBanner />

      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-white flex items-center gap-2.5">
          <BarChart2 className="w-6 h-6 text-[#39FF14]" />
          Model Qualification &amp; Defect Screening Evaluation
        </h2>
        <p className="text-xs text-muted font-space">
          Computed live from the active dataset ground-truth matrix. No hardcoded figures.
        </p>
      </div>

      {/* 2. Stat Tiles for Computed Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Precision"
          value={formatPercent(evaluation.precision_pct)}
          subtext={`${evaluation.true_positives} TP / ${evaluation.false_positives} FP`}
          icon={<Target className="w-5 h-5 text-[#39FF14]" />}
          variant="green"
        />

        <StatTile
          label="Defect Recall"
          value={formatPercent(evaluation.recall_pct)}
          subtext={`${evaluation.true_positives} caught out of ${evaluation.total_defects}`}
          icon={<ShieldCheck className="w-5 h-5 text-cyan-400" />}
          variant="cyan"
        />

        <StatTile
          label="F1 Score"
          value={evaluation.f1_score.toFixed(3)}
          subtext="Harmonic mean of precision/recall"
          icon={<Cpu className="w-5 h-5 text-[#FF9F1C]" />}
          variant="amber"
        />

        <StatTile
          label="90% Conformal Coverage"
          value={formatPercent(evaluation.coverage_90pct_conformal)}
          subtext={`MAE: ${formatMicroAmps(evaluation.mae_drift_uA)}`}
          icon={<Layers className="w-5 h-5 text-purple-400" />}
          variant="default"
        />
      </div>

      {/* 3. Defect Catch Recall by Injected Anomaly Type */}
      <ClippedPanel
        headerSlot={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-200">
              Defect Catch Recall by Failure Mechanism
            </span>
            <span className="text-[11px] font-mono text-muted">
              Live Evaluation Matrix
            </span>
          </div>
        }
      >
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={defectChartData} margin={{ top: 15, right: 25, left: -15, bottom: 20 }}>
              <XAxis
                dataKey="name"
                stroke="#8A94A6"
                fontSize={11}
                tickLine={false}
                tick={{ fill: '#8A94A6', fontFamily: 'monospace' }}
              />
              <YAxis
                stroke="#8A94A6"
                fontSize={11}
                tickLine={false}
                domain={[0, 100]}
                unit="%"
                tick={{ fill: '#8A94A6', fontFamily: 'monospace' }}
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload
                    return (
                      <div className="bg-[#09120D] border border-surface-border p-2.5 text-xs font-mono chamfer-sm">
                        <div className="font-bold text-white">{d.name}</div>
                        <div className="text-[#39FF14]">Recall: {d.recall}%</div>
                        <div className="text-muted">Detected: {d.detected} of {d.injected} injected</div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="recall" fill="#39FF14" radius={[4, 4, 0, 0]}>
                {defectChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#39FF14' : index === 1 ? '#00E5FF' : index === 2 ? '#FF9F1C' : '#FF3B3B'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ClippedPanel>

      {/* 4. Defect Breakdown Table with Small Samples Visibility */}
      <ClippedPanel
        headerSlot={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-200">
              Injected Latent Defect Sample Census
            </span>
            <span className="text-[11px] font-mono text-[#39FF14]">
              Sample Counts Explicitly Visible
            </span>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-surface-border text-muted uppercase text-[10px]">
                <th className="py-2.5 px-3">Defect Mechanism</th>
                <th className="py-2.5 px-3">Total Injected (n)</th>
                <th className="py-2.5 px-3">Detected by AGNIVEDH</th>
                <th className="py-2.5 px-3">Recall Rate</th>
                <th className="py-2.5 px-3">Primary Catching Layer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/40">
              {evaluation.defect_breakdown.map((item) => {
                const label =
                  item.defect_type === 'high_from_start'
                    ? 'Substrate Leakage (4.5x Batch Median, Under 50 µA)'
                    : item.defect_type === 'jump_first_24h'
                    ? 'Gate Oxide Breakdown (Sudden Jump at 24h)'
                    : item.defect_type === 'faster_creep'
                    ? 'Electro-migration (Non-linear 168h Creep)'
                    : 'Catastrophic Dielectric Short (<24h)'

                const layer =
                  item.defect_type === 'high_from_start'
                    ? 'Layer 2 (Module A MAD)'
                    : item.defect_type === 'jump_first_24h'
                    ? 'Layer 3 (Module B Drift)'
                    : item.defect_type === 'faster_creep'
                    ? 'Layer 3 (Module B Drift)'
                    : 'Layer 1 (Static Check)'

                return (
                  <tr key={item.defect_type} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">{label}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-bold">{item.total_injected}</td>
                    <td className="py-2.5 px-3 text-[#39FF14] font-bold">{item.detected_count}</td>
                    <td className="py-2.5 px-3 text-white font-bold">{formatPercent(item.recall_pct)}</td>
                    <td className="py-2.5 px-3 text-muted">{layer}</td>
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
