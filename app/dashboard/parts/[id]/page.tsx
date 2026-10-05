'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Cpu,
  ShieldAlert,
  ClipboardList,
  History,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ReferenceLine,
} from 'recharts'
import { useDashboard } from '@/components/dashboard/DashboardContext'
import { getApiClient } from '@/lib/api'
import { VedhMascot, VedhExpression } from '@/components/mascot/VedhMascot'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { ClippedPanel } from '@/components/ui/ClippedPanel'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/FeedbackStates'
import { useToast } from '@/components/ui/Toast'
import { Decision, PartRecord } from '@/lib/types'
import { formatMicroAmps } from '@/lib/utils'

export default function PartDetailPage() {
  const params = useParams()
  const router = useRouter()
  const partId = (params?.id as string)?.toUpperCase()
  const { parts, refreshData, isLoading } = useDashboard()
  const { addToast } = useToast()

  const part = parts.find((p) => p.part_id.toUpperCase() === partId)

  // Override modal state
  const [overrideModalOpen, setOverrideModalOpen] = useState(false)
  const [newDecision, setNewDecision] = useState<Decision>('ACCEPT')
  const [overrideNote, setOverrideNote] = useState('')
  const [inspectorName, setInspectorName] = useState('ISRO QA Inspector V-09')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModelContributions, setShowModelContributions] = useState(false)

  if (isLoading || !part) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  // Mascot expression matching decision
  const mascotExpression: VedhExpression =
    part.decision === 'REJECT' ? 'alert' : part.decision === 'REVIEW' ? 'alert' : 'happy'

  // Trajectory chart points formatting
  const chartData = part.trajectory.map((pt) => {
    return {
      hour: `${pt.hour}h`,
      hourNum: pt.hour,
      actual: pt.actual_uA,
      forecast: pt.forecast_uA,
      rangeMin: pt.forecast_lower_uA,
      rangeMax: pt.forecast_upper_uA,
      rangeBand:
        pt.forecast_upper_uA !== undefined && pt.forecast_lower_uA !== undefined
          ? [pt.forecast_lower_uA, pt.forecast_upper_uA]
          : undefined,
      batchMedian: pt.batch_median_uA,
    }
  })

  // Submit Override / Confirm Handler
  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!overrideNote.trim()) {
      addToast('A mandatory engineering justification note is required for all overrides.', 'error')
      return
    }

    try {
      setIsSubmitting(true)
      const client = getApiClient()
      await client.submitPartReview(
        part.part_id,
        inspectorName,
        'OVERRIDE',
        newDecision,
        overrideNote.trim()
      )
      await refreshData()
      setOverrideModalOpen(false)
      setOverrideNote('')
      addToast(`Part ${part.part_id} decision updated to ${newDecision}`, 'success', 'Audit Recorded')
    } catch (err: any) {
      addToast(err.message || 'Failed to submit review', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmAction = async () => {
    try {
      const client = getApiClient()
      await client.submitPartReview(
        part.part_id,
        inspectorName,
        'CONFIRM',
        part.decision,
        'Inspector confirmed automated AI multi-layer screening decision.'
      )
      await refreshData()
      addToast(`Confirmed decision for ${part.part_id}`, 'success')
    } catch (err: any) {
      addToast(err.message || 'Action failed', 'error')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Quick Nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/parts"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-muted hover:text-[#39FF14] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Parts Roster</span>
        </Link>
        <span className="text-xs font-mono text-muted">
          Batch: <Link href={`/dashboard/batches/${part.batch_id}`} className="text-[#39FF14] underline">{part.batch_id}</Link>
        </span>
      </div>

      {/* Part Header with Reactive Vedh Mascot */}
      <div className="bg-[#080E0B] border border-surface-border chamfer-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 relative shrink-0">
            <VedhMascot expression={mascotExpression} size={64} showGlow={false} showBadge={false} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-heading font-black text-white">
                {part.part_id}
              </h2>
              <StatusBadge status={part.decision} size="md" />
              {part.confidence === 'low' && (
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 chamfer-sm">
                  LOW CONFIDENCE POOLING
                </span>
              )}
            </div>
            <p className="text-xs font-space text-muted mt-1">
              Lot: <span className="font-mono text-slate-200">{part.batch_id}</span> • Type: <span className="font-mono text-slate-200">{part.part_type}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Confirm / Override */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleConfirmAction}
            leftIcon={<CheckCircle2 className="w-4 h-4 text-[#39FF14]" />}
          >
            Confirm Decision
          </Button>

          <Button
            variant="amber"
            size="sm"
            glow
            onClick={() => {
              setNewDecision(part.decision === 'ACCEPT' ? 'REVIEW' : 'ACCEPT')
              setOverrideModalOpen(true)
            }}
          >
            Override Decision
          </Button>
        </div>
      </div>

      {/* Structured Reason Card (Plain-English summary, 3 layer rows, what to check, warnings) */}
      <ClippedPanel
        headerSlot={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#39FF14]" />
              <span className="text-xs font-heading font-bold text-white uppercase tracking-wider">
                Explainable Multi-Layer Reason Card
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted">
              Deterministic Physics Proof
            </span>
          </div>
        }
      >
        <div className="space-y-5">
          {/* One-line Plain-English Summary */}
          <div className="p-3.5 bg-black/40 border border-surface-border chamfer-sm">
            <span className="text-[10px] font-mono text-[#39FF14] uppercase tracking-wider block mb-1">
              EXECUTIVE INSPECTOR SUMMARY
            </span>
            <p className="text-xs sm:text-sm text-slate-100 font-space font-medium leading-relaxed">
              {part.reason_card.summary}
            </p>
          </div>

          {/* Three Layer Rows */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {part.reason_card.layers.map((layer) => {
              const isTriggered = layer.triggered
              return (
                <div
                  key={layer.layer}
                  className={`p-4 chamfer-sm border text-xs font-space flex flex-col justify-between ${
                    isTriggered
                      ? 'border-[#FF9F1C]/50 bg-[#140D07]'
                      : 'border-surface-border bg-black/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-heading font-bold uppercase text-[11px] text-white">
                        {layer.layer === 'static'
                          ? 'Layer 1: Static Check'
                          : layer.layer === 'batch_outlier'
                          ? 'Layer 2: Module A (Outlier)'
                          : 'Layer 3: Module B (Drift)'}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.2 chamfer-sm ${
                          isTriggered
                            ? 'bg-amber/20 text-[#FF9F1C] border border-amber/40'
                            : 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30'
                        }`}
                      >
                        {isTriggered ? 'TRIGGERED' : 'PASS'}
                      </span>
                    </div>

                    {/* Numeric details */}
                    {layer.score !== undefined && (
                      <div className="text-[11px] font-mono text-slate-300 mb-1">
                        Outlier Score: <span className="font-bold text-[#FF9F1C]">{layer.score}</span> (Threshold: 4.5)
                      </div>
                    )}
                    {layer.effective_limit_uA !== undefined && (
                      <div className="text-[11px] font-mono text-slate-300 mb-1">
                        Effective Limit: <span className="font-bold text-[#39FF14]">{formatMicroAmps(layer.effective_limit_uA)}</span>
                      </div>
                    )}
                    {layer.predicted_168h_uA !== undefined && (
                      <div className="text-[11px] font-mono text-slate-300 mb-1">
                        168h Forecast: <span className="font-bold text-[#39FF14]">{formatMicroAmps(layer.predicted_168h_uA)}</span>
                      </div>
                    )}

                    <p className="text-[11px] text-muted leading-relaxed mt-2">{layer.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* What to check & Warnings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* What to check */}
            <div className="p-3.5 bg-black/40 border border-surface-border chamfer-sm space-y-2">
              <span className="text-[10px] font-mono text-[#39FF14] uppercase tracking-wider block font-bold">
                RECOMMENDED INSPECTOR CHECKS
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300 font-space">
                {part.reason_card.what_to_check.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#39FF14] font-bold">›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Warnings list */}
            <div className="p-3.5 bg-black/40 border border-surface-border chamfer-sm space-y-2">
              <span className="text-[10px] font-mono text-[#FF9F1C] uppercase tracking-wider block font-bold">
                PHYSICS &amp; COHORT WARNINGS
              </span>
              {part.reason_card.warnings.length === 0 ? (
                <p className="text-xs text-muted font-space">
                  No statistical warnings or chamber gradient alerts recorded.
                </p>
              ) : (
                <ul className="space-y-1.5 text-xs text-amber-200 font-space">
                  {part.reason_card.warnings.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#FF9F1C] shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </ClippedPanel>

      {/* Trajectory Forecast Chart (0, 24, 48, 96, 168h with bounds, limit lines) */}
      <ClippedPanel
        headerSlot={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#39FF14]" />
              <span className="text-xs font-heading font-bold text-white uppercase tracking-wider">
                168-Hour Burn-in Thermal Drift Trajectory
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#39FF14]">
              Forecast from 24h Telemetry
            </div>
          </div>
        }
      >
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 35, left: -10, bottom: 20 }}>
              <XAxis
                dataKey="hour"
                stroke="#8A94A6"
                fontSize={11}
                tickLine={false}
                tick={{ fill: '#8A94A6', fontFamily: 'monospace' }}
              />
              <YAxis
                stroke="#8A94A6"
                fontSize={11}
                tickLine={false}
                tick={{ fill: '#8A94A6', fontFamily: 'monospace' }}
                unit=" µA"
              />
              <RechartsTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload
                    return (
                      <div className="bg-[#09120D] border border-surface-border p-3 text-xs font-mono chamfer-sm space-y-1">
                        <div className="font-bold text-white border-b border-surface-border pb-1">
                          Burn-in Time: {label}
                        </div>
                        {d.actual !== undefined && (
                          <div className="text-white">Actual Reading: <span className="font-bold">{d.actual} µA</span></div>
                        )}
                        {d.forecast !== undefined && (
                          <div className="text-[#39FF14]">Forecast Trajectory: <span className="font-bold">{d.forecast} µA</span></div>
                        )}
                        {d.rangeMin !== undefined && (
                          <div className="text-cyan-400">90% Prediction Range: [{d.rangeMin} – {d.rangeMax}] µA</div>
                        )}
                        {d.batchMedian !== undefined && (
                          <div className="text-muted">Batch Peer Median: {d.batchMedian} µA</div>
                        )}
                      </div>
                    )
                  }
                  return null
                }}
              />

              {/* Datasheet max limit reference line */}
              <ReferenceLine
                y={part.datasheet_limit_uA}
                stroke="#FF3B3B"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Datasheet Max: ${part.datasheet_limit_uA} µA`,
                  position: 'insideTopRight',
                  fill: '#FF3B3B',
                  fontSize: 10,
                  fontFamily: 'monospace',
                }}
              />

              {/* Effective batch limit reference line */}
              <ReferenceLine
                y={part.effective_limit_uA}
                stroke="#FF9F1C"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: `Effective Limit: ${part.effective_limit_uA.toFixed(1)} µA`,
                  position: 'insideBottomRight',
                  fill: '#FF9F1C',
                  fontSize: 10,
                  fontFamily: 'monospace',
                }}
              />

              {/* Batch median baseline */}
              <Line
                type="monotone"
                dataKey="batchMedian"
                stroke="#8A94A6"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={false}
                name="Batch Peer Median"
              />

              {/* Forecast Line */}
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#39FF14"
                strokeWidth={2}
                dot={{ r: 4, fill: '#39FF14' }}
                name="Forecast Model"
              />

              {/* Actual Readings Points */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#FFFFFF"
                strokeWidth={2.5}
                dot={{ r: 5, fill: '#FFFFFF', stroke: '#39FF14', strokeWidth: 1.5 }}
                name="Actual Chamber Readings"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Trajectory Legend */}
        <div className="mt-4 pt-3 border-t border-surface-border/50 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-white">
              <span className="w-3 h-3 rounded-full border-2 border-[#39FF14] bg-white" />
              Actual Soak Readings
            </span>
            <span className="flex items-center gap-1.5 text-[#39FF14]">
              <span className="w-4 h-0.5 bg-[#39FF14]" />
              Projected 168h Trajectory
            </span>
            <span className="flex items-center gap-1.5 text-[#FF9F1C]">
              <span className="w-4 h-0.5 border-t border-dashed border-[#FF9F1C]" />
              Batch Effective Limit ({formatMicroAmps(part.effective_limit_uA)})
            </span>
            <span className="flex items-center gap-1.5 text-reject">
              <span className="w-4 h-0.5 border-t border-dashed border-reject" />
              Datasheet Limit (50 µA)
            </span>
          </div>
          <div className="text-muted text-[11px]">
            Trained with L2 Ridge regularized burn-in features
          </div>
        </div>
      </ClippedPanel>

      {/* Inspector Override Audit History */}
      <ClippedPanel
        headerSlot={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#39FF14]" />
              <span className="text-xs font-heading font-bold text-white uppercase tracking-wider">
                Inspector Audit Log ({part.audit_history.length})
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted">
              Permanent Human-in-the-Loop Trace
            </span>
          </div>
        }
      >
        {part.audit_history.length === 0 ? (
          <p className="text-xs text-muted font-space py-3 text-center">
            No manual overrides recorded for this component. Current status reflects automated multi-layer AI consensus.
          </p>
        ) : (
          <div className="space-y-3">
            {part.audit_history.map((record) => (
              <div
                key={record.id}
                className="p-3 bg-black/40 border border-surface-border chamfer-sm text-xs font-space"
              >
                <div className="flex items-center justify-between mb-1.5 font-mono text-[11px]">
                  <span className="text-[#39FF14] font-bold">{record.inspector_name}</span>
                  <span className="text-muted">{new Date(record.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 mb-1.5 font-mono text-xs">
                  <span className="text-muted uppercase">Action:</span>
                  <span className="text-white font-bold">{record.action}</span>
                  <span className="text-muted">({record.original_decision} → {record.new_decision})</span>
                </div>
                <div className="text-slate-300 italic bg-[#050A07] p-2 border border-surface-border/40">
                  &quot;{record.note}&quot;
                </div>
              </div>
            ))}
          </div>
        )}
      </ClippedPanel>

      {/* Collapsible Model Contributions Panel */}
      <div className="border border-surface-border bg-[#080E0B] chamfer-md overflow-hidden">
        <button
          type="button"
          onClick={() => setShowModelContributions(!showModelContributions)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-heading font-bold uppercase tracking-wider text-slate-200 hover:text-white bg-black/30"
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#39FF14]" />
            <span>Underlying Model Weight Contributions</span>
          </div>
          {showModelContributions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showModelContributions && (
          <div className="p-5 border-t border-surface-border space-y-3 text-xs font-space animate-in fade-in duration-200">
            <p className="text-muted text-[11px]">
              Relative feature attribution calculated from the 0-24h Ridge burn-in forecaster model:
            </p>
            <div className="space-y-2 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>ln(I_leak_0h) [Baseline Initial Leakage]</span>
                  <span className="text-[#39FF14]">52% Weight</span>
                </div>
                <div className="h-1.5 bg-black rounded-full overflow-hidden">
                  <div className="h-full bg-[#39FF14]" style={{ width: '52%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>delta_ln(24h - 0h) [Early Soak Velocity]</span>
                  <span className="text-[#39FF14]">28% Weight</span>
                </div>
                <div className="h-1.5 bg-black rounded-full overflow-hidden">
                  <div className="h-full bg-[#39FF14]" style={{ width: '28%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Relative Drift vs Batch Median</span>
                  <span className="text-[#FF9F1C]">14% Weight</span>
                </div>
                <div className="h-1.5 bg-black rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF9F1C]" style={{ width: '14%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Thermal Chamber Stress Factor (125°C)</span>
                  <span className="text-muted">6% Weight</span>
                </div>
                <div className="h-1.5 bg-black rounded-full overflow-hidden">
                  <div className="h-full bg-slate-500" style={{ width: '6%' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Override Modal */}
      <Modal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        title={`Override Decision for ${part.part_id}`}
        description="Engineering overrides require explicit rationale and are recorded in the lot export"
        maxWidth="md"
      >
        <form onSubmit={handleOverrideSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-muted uppercase block mb-1">
              Select New Decision:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['ACCEPT', 'REVIEW', 'REJECT'] as Decision[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setNewDecision(d)}
                  className={`p-2.5 text-xs font-mono font-bold chamfer-sm border transition-all ${
                    newDecision === d
                      ? d === 'ACCEPT'
                        ? 'bg-[#39FF14]/20 border-[#39FF14] text-[#39FF14]'
                        : d === 'REVIEW'
                        ? 'bg-[#FF9F1C]/20 border-[#FF9F1C] text-[#FF9F1C]'
                        : 'bg-reject/20 border-reject text-reject'
                      : 'border-surface-border text-muted bg-black/40'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Mandatory Inspector Justification Note"
            placeholder="Explain engineering rationale (e.g., 'Retested pin contact; baseline elevated due to socket impedance, second run normal at 11.2 µA')."
            value={overrideNote}
            onChange={(e) => setOverrideNote(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setOverrideModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="amber"
              size="sm"
              type="submit"
              loading={isSubmitting}
              disabled={!overrideNote.trim()}
            >
              Commit Override
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
