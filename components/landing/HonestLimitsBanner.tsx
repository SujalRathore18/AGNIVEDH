'use client'

import React from 'react'
import { AlertCircle, Sliders } from 'lucide-react'

export const HonestLimitsBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`w-full bg-[#161008] border border-amber/50 chamfer-md p-5 text-amber-200 text-xs font-space relative overflow-hidden ${className}`}
      role="region"
      aria-label="Engineering disclaimer and calibration notes"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
        <div className="p-2 bg-amber/20 text-[#FF9F1C] border border-amber/40 chamfer-sm shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#FF9F1C]">
              07 // HONEST ENGINEERING LIMITS &amp; CALIBRATION PROTOCOL
            </span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            Results use synthetic data and are not proof of real-world performance. Real-defect performance is proven only after calibration on ISRO burn-in history.
          </p>
        </div>
      </div>
    </div>
  )
}
