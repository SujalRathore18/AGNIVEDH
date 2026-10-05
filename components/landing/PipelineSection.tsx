'use client'

import React, { useState } from 'react'
import { Database, ShieldCheck, Cpu, GitFork, FileCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export const PipelineSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      num: '01',
      title: 'Ingest & Check',
      icon: Database,
      short: 'CSV Parse & Sanity Check',
      description:
        'Validates row structures, timestamps (0h, 24h, 48h, 96h, 168h), drops non-physical negative currents, flags units magnitude errors, and verifies thermal conditions.',
      output: 'Cleaned lot telemetry with dropped-row audit record',
    },
    {
      num: '02',
      title: 'Static Check',
      icon: ShieldCheck,
      short: 'Absolute Datasheet Gate',
      description:
        'Instantly compares every point against the datasheet limit (e.g. 50 µA). Blatant hard fails are immediately quarantined.',
      output: 'Hard pass/fail list',
    },
    {
      num: '03',
      title: 'Batch Outlier (Mod A)',
      icon: Cpu,
      short: 'Log-scale MAD Reference',
      description:
        'Computes median and MAD on natural log scale. Establishes learned limit: min(exp(median + 4.5×MAD), datasheet). Small batches (<30) pool across wafer history with low confidence flag.',
      output: 'Outlier score & batch effective limit',
    },
    {
      num: '04',
      title: 'Drift Forecast (Mod B)',
      icon: GitFork,
      short: 'Early Trajectory Inference',
      description:
        'Extracts first-24h delta and batch relative slope. Predicts 168h leakage with conformal prediction interval bounds. Runs 96h self-consistency check.',
      output: 'Projected 168h leakage and 90% confidence range',
    },
    {
      num: '05',
      title: 'Decide & Explain',
      icon: FileCheck,
      short: 'Consensus & Reason Card',
      description:
        'Synthesizes multi-layer consensus: Accept, Review, or Reject. Produces structured plain-English reason card with physics rationale, and aggregates batch risk rating.',
      output: 'Actionable inspector card & exportable audit log',
    },
  ]

  return (
    <section className="w-full my-16 bg-[#080E0B] border border-surface-border chamfer-lg p-6 sm:p-10 relative">
      <div className="max-w-2xl mb-8">
        <span className="text-xs font-mono text-[#39FF14] uppercase tracking-wider block mb-1">
          03 // WORKFLOW PIPELINE
        </span>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">
          How AGNIVEDH Operates
        </h2>
        <p className="text-xs sm:text-sm text-muted font-space">
          Click each step to inspect the deterministic 5-stage qualification pipeline.
        </p>
      </div>

      {/* Pipeline Navigation / Step Tracker */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-8">
        {steps.map((s, idx) => {
          const Icon = s.icon
          const isActive = idx === activeStep
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setActiveStep(idx)}
              className={cn(
                'p-3 text-left border chamfer-sm transition-all duration-200 cursor-pointer select-none',
                isActive
                  ? 'bg-[#13261C] border-[#39FF14] text-[#39FF14] shadow-[0_0_12px_rgba(57,255,20,0.25)]'
                  : 'bg-black/40 border-surface-border text-muted hover:border-surface-borderHover hover:text-slate-200'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold">{s.num}</span>
                <Icon className="w-4 h-4 shrink-0" />
              </div>
              <div className="text-xs font-heading font-bold truncate text-slate-100">{s.title}</div>
            </button>
          )
        })}
      </div>

      {/* Active Step Details Panel */}
      <div className="p-6 bg-black/50 border border-surface-border chamfer-md transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#39FF14] bg-[#39FF14]/15 px-2 py-0.5 border border-[#39FF14]/30 chamfer-sm">
              STAGE {steps[activeStep].num}
            </span>
            <h3 className="text-lg font-heading font-bold text-white">
              {steps[activeStep].title} — {steps[activeStep].short}
            </h3>
          </div>
          <div className="text-xs font-mono text-muted">
            Step {activeStep + 1} of 5
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 font-space leading-relaxed mb-6">
          {steps[activeStep].description}
        </p>

        <div className="p-3 bg-[#0A130F] border border-[#39FF14]/20 chamfer-sm flex items-center justify-between gap-3 text-xs font-mono">
          <span className="text-muted uppercase">Stage Output Deliverable:</span>
          <span className="text-[#39FF14] font-bold">{steps[activeStep].output}</span>
        </div>
      </div>
    </section>
  )
}
