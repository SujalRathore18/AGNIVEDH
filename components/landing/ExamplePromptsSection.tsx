'use client'

import React from 'react'
import { Terminal, ArrowUpRight } from 'lucide-react'

interface ExamplePromptsSectionProps {
  onSelectPrompt?: (prompt: string) => void
}

export const ExamplePromptsSection: React.FC<ExamplePromptsSectionProps> = ({ onSelectPrompt }) => {
  const examplePrompts = [
    {
      title: 'Latent Substrate Outlier',
      prompt: 'Why was part P-0007 flagged?',
      description: 'Explains how a 45 µA component in a 10 µA batch was flagged by Module A despite being under 50 µA.',
      tag: 'OUTLIER INSPECTION',
    },
    {
      title: 'Lot Risk Assessment',
      prompt: 'Which batches are risky?',
      description: 'Lists batches exceeding anomaly rate gates or requiring review due to sub-30 sample sizes.',
      tag: 'BATCH TRIAGE',
    },
    {
      title: 'Physics & Statistics Boundary',
      prompt: 'Is 45 µA safe in a 10 µA batch?',
      description: 'Shows the exact mathematical proof using ln-scale MAD and 4.5× threshold.',
      tag: 'LIMIT PROOF',
    },
    {
      title: 'Early Thermal Trajectory',
      prompt: 'Show parts that drift faster than their batch',
      description: 'Identifies parts with non-linear drift in the first 24h that risk 168h end-of-test failure.',
      tag: 'PREDICTIVE DRIFT',
    },
    {
      title: 'Statistical Reliability Guard',
      prompt: 'What does low confidence mean?',
      description: 'Explains sample size pooling under 30 components and routing to inspector Review lane.',
      tag: 'QUALIFICATION LOGIC',
    },
    {
      title: 'Clean Lot Verification',
      prompt: 'Tell me about P-0001',
      description: 'Shows full telemetry for a nominal accepted component with healthy micro-drift.',
      tag: 'HEALTHY BASELINE',
    },
  ]

  const handleClick = (pText: string) => {
    if (onSelectPrompt) {
      onSelectPrompt(pText)
    }
    const askElem = document.getElementById('ask-agnivedh-section')
    if (askElem) {
      askElem.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="w-full my-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-mono text-[#39FF14] uppercase tracking-wider block mb-1">
          04 // NATURAL LANGUAGE PROBING
        </span>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">
          Clickable Prompts &amp; Operational Use Cases
        </h2>
        <p className="text-xs sm:text-sm text-muted font-space">
          Click any card to prefill the reasoning console with verified telemetry queries.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {examplePrompts.map((item, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(item.prompt)}
            className="group p-5 bg-[#080E0B] border border-surface-border hover:border-[#39FF14]/50 chamfer-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-[10px] font-mono text-muted uppercase px-2 py-0.5 bg-black/40 border border-surface-border chamfer-sm">
                  {item.tag}
                </span>
                <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-[#39FF14] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <h4 className="text-sm font-heading font-bold text-slate-100 group-hover:text-[#39FF14] transition-colors mb-2">
                &quot;{item.prompt}&quot;
              </h4>
              <p className="text-xs text-muted font-space leading-relaxed">{item.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-surface-border/50 text-[11px] font-mono text-[#39FF14] flex items-center gap-1">
              <Terminal className="w-3 h-3" /> Probe this telemetry →
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
