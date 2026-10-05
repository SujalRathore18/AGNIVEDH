'use client'

import React from 'react'
import { Sparkles, TrendingUp, Cpu, FileText, Layers } from 'lucide-react'
import { FeatureCard } from '@/components/ui/FeatureCard'

export const InnovationsSection: React.FC = () => {
  const innovations = [
    {
      num: '01',
      title: 'Forecasts 168h Leakage in µA',
      desc: 'Instead of waiting 7 full days of chamber soak, early 24h trajectory dynamics project final leakage and 90% confidence bounds.',
      icon: <TrendingUp className="w-5 h-5 text-[#39FF14]" />,
    },
    {
      num: '02',
      title: 'Learns Limits Directly from Batch',
      desc: 'Adapts to wafer fab lot variations using robust log-scale MAD statistics, computing learned effective limits rather than static guessing.',
      icon: <Cpu className="w-5 h-5 text-amber" />,
    },
    {
      num: '03',
      title: 'Explains Every Flag to QA Inspector',
      desc: 'Zero black-box decisions. Generates structured Reason Cards detailing exact MAD scores, baseline offsets, and physical failure modes to check.',
      icon: <FileText className="w-5 h-5 text-cyan-400" />,
    },
    {
      num: '04',
      title: 'Makes the Final Call at Batch Level',
      desc: 'Holistic lot gating that prevents deploying batches with elevated latent failure distributions or small-sample risk.',
      icon: <Layers className="w-5 h-5 text-purple-400" />,
    },
  ]

  return (
    <section className="w-full my-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-mono text-[#39FF14] uppercase tracking-wider block mb-1">
          05 // INNOVATION MATRIX
        </span>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">
          What Sets AGNIVEDH Apart
        </h2>
        <p className="text-xs sm:text-sm text-muted font-space">
          Four critical breakthroughs built for satellite component reliability and mission safety.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {innovations.map((item) => (
          <FeatureCard
            key={item.num}
            stepNumber={item.num}
            title={item.title}
            description={item.desc}
            icon={item.icon}
            variant="default"
          />
        ))}
      </div>
    </section>
  )
}
