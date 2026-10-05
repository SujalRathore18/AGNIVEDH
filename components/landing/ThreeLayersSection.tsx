'use client'

import React from 'react'
import { ShieldAlert, BarChart3, TrendingUp, Check, ArrowRight } from 'lucide-react'
import { FeatureCard } from '@/components/ui/FeatureCard'

export const ThreeLayersSection: React.FC = () => {
  return (
    <section className="w-full my-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-mono text-[#39FF14] uppercase tracking-wider block mb-1">
          02 // MULTI-LAYER DEFENSE ARCHITECTURE
        </span>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-3">
          Three Layers of Physics &amp; AI Screening
        </h2>
        <p className="text-xs sm:text-sm text-muted font-space">
          Rather than relying on a single brittle threshold, AGNIVEDH combines statutory specs, peer cohort statistics, and predictive dynamics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Layer 1 */}
        <FeatureCard
          stepNumber="01"
          title="Layer 1: Static Limit"
          description="Direct compliance verification against the manufacturer and mission qualification datasheet."
          tag="PHYSICAL BOUND"
          icon={<ShieldAlert className="w-5 h-5 text-reject" />}
          variant="default"
        >
          <div className="space-y-2 text-xs font-space">
            <div className="text-slate-200 font-semibold mb-1">Core Question:</div>
            <p className="text-muted italic">&quot;Is it over the legal limit?&quot;</p>
            <div className="text-slate-200 font-semibold mt-3 mb-1">What it catches:</div>
            <ul className="space-y-1 text-slate-300">
              <li className="flex items-center gap-1.5 text-[11px]">
                <Check className="w-3.5 h-3.5 text-reject shrink-0" />
                Dead on arrival (DOA) components
              </li>
              <li className="flex items-center gap-1.5 text-[11px]">
                <Check className="w-3.5 h-3.5 text-reject shrink-0" />
                Severe dielectric breakdown &gt; 50 µA
              </li>
              <li className="flex items-center gap-1.5 text-[11px]">
                <Check className="w-3.5 h-3.5 text-reject shrink-0" />
                Gross packaging contamination
              </li>
            </ul>
          </div>
        </FeatureCard>

        {/* Layer 2 */}
        <FeatureCard
          stepNumber="02"
          title="Layer 2: Batch Outlier (Module A)"
          description="Robust log-scale median and MAD statistics learned dynamically from the wafer lot distribution."
          tag="COHORT ANOMALY"
          icon={<BarChart3 className="w-5 h-5 text-amber" />}
          variant="amber"
        >
          <div className="space-y-2 text-xs font-space">
            <div className="text-slate-200 font-semibold mb-1">Core Question:</div>
            <p className="text-[#FF9F1C] italic">&quot;Is it odd compared with its own batch?&quot;</p>
            <div className="text-slate-200 font-semibold mt-3 mb-1">What it catches:</div>
            <ul className="space-y-1 text-slate-300">
              <li className="flex items-center gap-1.5 text-[11px]">
                <Check className="w-3.5 h-3.5 text-[#FF9F1C] shrink-0" />
                45 µA parts in 10 µA batches
              </li>
              <li className="flex items-center gap-1.5 text-[11px]">
                <Check className="w-3.5 h-3.5 text-[#FF9F1C] shrink-0" />
                Substrate micro-fissures and marginal doping
              </li>
              <li className="flex items-center gap-1.5 text-[11px]">
                <Check className="w-3.5 h-3.5 text-[#FF9F1C] shrink-0" />
                Low-confidence warning on batches &lt; 30 parts
              </li>
            </ul>
          </div>
        </FeatureCard>

        {/* Layer 3 */}
        <FeatureCard
          stepNumber="03"
          title="Layer 3: Drift Forecast (Module B)"
          description="Ridge-regularized trajectory extrapolation from 0–24h burn-in telemetry to 168h completion."
          tag="PREDICTIVE AGING"
          icon={<TrendingUp className="w-5 h-5 text-[#39FF14]" />}
          variant="primary"
        >
          <div className="space-y-2 text-xs font-space">
            <div className="text-slate-200 font-semibold mb-1">Core Question:</div>
            <p className="text-[#39FF14] italic">&quot;Where will it be at 168 hours?&quot;</p>
            <div className="text-slate-200 font-semibold mt-3 mb-1">What it catches:</div>
            <ul className="space-y-1 text-slate-300">
              <li className="flex items-center gap-1.5 text-[11px]">
                <Check className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                First-24h step jumps and runaway creep
              </li>
              <li className="flex items-center gap-1.5 text-[11px]">
                <Check className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                Forecast breaches before 168h soak ends
              </li>
              <li className="flex items-center gap-1.5 text-[11px]">
                <Check className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                96h trajectory consistency deviations
              </li>
            </ul>
          </div>
        </FeatureCard>
      </div>
    </section>
  )
}
