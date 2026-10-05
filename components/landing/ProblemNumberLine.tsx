'use client'

import React, { useState } from 'react'
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import { formatMicroAmps } from '@/lib/utils'

export const ProblemNumberLine: React.FC = () => {
  const [testCurrent, setTestCurrent] = useState<number>(45.0)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  // Distribution constants
  const batchMedian = 10.0
  const datasheetLimit = 50.0
  const learnedLimit = 22.5 // exp(ln(10) + 4.5 * 0.18)

  // Max scale on number line
  const maxScale = 60.0

  // Clustered healthy peer dots near 10 uA
  const healthyDots = [8.4, 9.1, 9.6, 10.0, 10.2, 10.8, 11.5, 12.2]

  const getPercent = (val: number) => Math.min(100, (val / maxScale) * 100)

  // Evaluate test current
  const isOverDatasheet = testCurrent > datasheetLimit
  const isOverLearned = testCurrent > learnedLimit
  const outlierScore = (Math.log(Math.max(testCurrent, 0.1)) - Math.log(batchMedian)) / 0.18

  return (
    <div className="w-full bg-[#080E0B] border border-surface-border chamfer-lg p-6 sm:p-8 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-mono text-[#39FF14] uppercase tracking-wider block mb-1">
            01 // THE CORE LATENT DEFECT PARADOX
          </span>
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-white">
            Passing the datasheet limit is not the same as being healthy.
          </h3>
        </div>
        <div className="px-3 py-1.5 bg-[#12231A] border border-[#39FF14]/40 text-[#39FF14] text-xs font-mono chamfer-sm">
          ISRO MISSION RELIABILITY
        </div>
      </div>

      <p className="text-xs sm:text-sm text-muted font-space leading-relaxed max-w-3xl mb-8">
        Standard qualification only checks if leakage current is under the datasheet maximum (50 µA). A component drawing 45 µA in a batch where every other peer draws 10 µA passes conventional screening—yet carries a 4.5× latent risk that accelerates during orbital radiation and thermal cycling.
      </p>

      {/* Interactive Number-line Visualization */}
      <div className="bg-black/50 border border-surface-border chamfer-md p-6 my-6 relative">
        <div className="text-xs font-mono text-muted mb-8 flex justify-between items-center">
          <span>0 µA (ZERO LEAKAGE)</span>
          <span className="text-[#39FF14]">BATCH NORM (~10 µA)</span>
          <span className="text-[#FF9F1C]">LEARNED LIMIT (22.5 µA)</span>
          <span className="text-[#FF3B3B]">DATASHEET CEILING (50 µA)</span>
        </div>

        {/* The Number Line Track */}
        <div className="relative h-4 bg-[#111C16] rounded-full border border-surface-border">
          {/* Healthy cluster band */}
          <div
            className="absolute top-0 bottom-0 bg-[#39FF14]/20 rounded-full"
            style={{
              left: `${getPercent(7.5)}%`,
              width: `${getPercent(14) - getPercent(7.5)}%`,
            }}
          />

          {/* Healthy Peer Dots */}
          {healthyDots.map((val, idx) => (
            <div
              key={idx}
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#39FF14] shadow-[0_0_6px_#39FF14] cursor-pointer hover:scale-150 transition-transform"
              style={{ left: `${getPercent(val)}%` }}
              onMouseEnter={() => setActiveTooltip(`Healthy Peer: ${val} µA`)}
              onMouseLeave={() => setActiveTooltip(null)}
            />
          ))}

          {/* Learned limit line (22.5 uA) */}
          <div
            className="absolute -top-3 bottom-[-12px] w-0.5 bg-[#FF9F1C] shadow-[0_0_8px_#FF9F1C]"
            style={{ left: `${getPercent(learnedLimit)}%` }}
          >
            <div className="absolute bottom-[-22px] -translate-x-1/2 text-[10px] font-mono text-[#FF9F1C] whitespace-nowrap bg-black/80 px-1 border border-amber/40 chamfer-sm">
              Learned: 22.5 µA
            </div>
          </div>

          {/* Datasheet limit dashed line (50 uA) */}
          <div
            className="absolute -top-3 bottom-[-12px] w-0.5 border-l-2 border-dashed border-[#FF3B3B]"
            style={{ left: `${getPercent(datasheetLimit)}%` }}
          >
            <div className="absolute bottom-[-22px] -translate-x-1/2 text-[10px] font-mono text-[#FF3B3B] whitespace-nowrap bg-black/80 px-1 border border-reject/40 chamfer-sm">
              Datasheet: 50.0 µA
            </div>
          </div>

          {/* Active Probe Dot (e.g. 45 µA red dot) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FF3B3B] border-2 border-white shadow-[0_0_12px_#FF3B3B] animate-pulse z-20 cursor-pointer"
            style={{ left: `${getPercent(testCurrent)}%` }}
            onMouseEnter={() => setActiveTooltip(`Latent Outlier: ${testCurrent.toFixed(1)} µA`)}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div className="absolute -top-9 -translate-x-1/2 bg-[#1A0A0A] border border-[#FF3B3B] text-[#FF3B3B] text-[10px] font-mono font-bold px-2 py-0.5 chamfer-sm whitespace-nowrap shadow-[0_0_10px_rgba(255,59,59,0.4)]">
              {testCurrent.toFixed(1)} µA (4.5× batch median)
            </div>
          </div>
        </div>

        {/* Dynamic Tooltip Display */}
        <div className="mt-12 h-6 text-center text-xs font-mono text-[#39FF14]">
          {activeTooltip ? activeTooltip : 'Hover over any dot or adjust the slider below to test the physics model.'}
        </div>
      </div>

      {/* Interactive slider */}
      <div className="mt-6 pt-4 border-t border-surface-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <label htmlFor="current-slider" className="text-xs font-mono text-muted uppercase flex justify-between mb-1.5">
            <span>Simulate Probe Leakage:</span>
            <span className="font-bold text-white">{formatMicroAmps(testCurrent)}</span>
          </label>
          <input
            id="current-slider"
            type="range"
            min="5"
            max="55"
            step="0.5"
            value={testCurrent}
            onChange={(e) => setTestCurrent(parseFloat(e.target.value))}
            className="w-full accent-[#39FF14] bg-surface-muted cursor-pointer"
          />
        </div>

        {/* Decision Result Preview */}
        <div className="p-3 bg-[#0A140F] border border-surface-border chamfer-sm flex items-center gap-3">
          {isOverDatasheet ? (
            <div className="flex items-center gap-2 text-xs font-mono text-reject font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Layer 1 REJECT (Exceeds Datasheet Limit)</span>
            </div>
          ) : isOverLearned ? (
            <div className="flex items-center gap-2 text-xs font-mono text-amber font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#FF9F1C]" />
              <span>Layer 2 FLAGGED (MAD Score {outlierScore.toFixed(1)} &gt; 4.5)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono text-[#39FF14] font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Within Batch Statistical Bounds (Pass)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
