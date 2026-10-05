'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { BRANDING } from '@/lib/constants'
import { Modal } from './Modal'

export const Footer: React.FC = () => {
  const [termsOpen, setTermsOpen] = useState(false)

  return (
    <>
      <footer className="w-full border-t border-surface-border bg-[#05070A] py-12 px-4 sm:px-6 lg:px-8 mt-20 relative z-10 text-xs font-space text-muted">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-md">
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-sm tracking-wider text-white">
                {BRANDING.name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/40 chamfer-sm">
                PROTOTYPE
              </span>
            </div>
            <p className="text-slate-300 font-medium text-xs">
              {BRANDING.full_title}
            </p>
            <p className="text-muted-dark text-[11px] italic">
              &quot;{BRANDING.tagline}&quot;
            </p>
          </div>

          <div className="flex flex-col md:items-end space-y-2">
            <div className="font-mono text-slate-200 text-xs">
              {BRANDING.footer_credit}
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-muted">
              <button
                type="button"
                onClick={() => setTermsOpen(true)}
                className="hover:text-[#39FF14] underline underline-offset-4 cursor-pointer"
              >
                Terms of Use &amp; Calibration Notes
              </button>
              <Link href="/dashboard" className="hover:text-[#39FF14]">
                Inspector Console →
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-surface-border/50 text-[11px] text-muted-dark flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Deterministic offline physics inference engine. No proprietary data sent to external networks.</span>
          <span>© 2026 Team GSR NEXUS. Smart India Hackathon.</span>
        </div>
      </footer>

      {/* Terms and Calibration Modal */}
      <Modal
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
        title="Terms of Use & Calibration Protocol"
        description="Guidelines for space component burn-in qualification and synthetic model limits"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs font-space text-slate-300 leading-relaxed">
          <div className="p-3 bg-[#122218] border border-[#39FF14]/30 chamfer-sm">
            <h5 className="font-heading font-bold text-[#39FF14] text-xs uppercase mb-1">
              Synthetic Baseline Notice
            </h5>
            <p className="text-slate-300 text-[11px]">
              This software demonstrator uses synthetic burn-in telemetry generated under lognormal physics distributions with seeded defect injection. Results are illustrative and not empirical certification of real-world silicon performance.
            </p>
          </div>

          <div>
            <h5 className="font-heading font-bold text-white mb-1">1. Calibration Requirement</h5>
            <p className="text-muted">
              Production deployment for flight mission qualification requires full calibration using ISRO historical burn-in lot records (168-hour thermal chamber runs at 125°C).
            </p>
          </div>

          <div>
            <h5 className="font-heading font-bold text-white mb-1">2. Human-in-the-Loop Authority</h5>
            <p className="text-muted">
              The AI engine serves as an advisory decision support system. Any component flagged in the Review lane requires mandatory confirmation by a qualified Quality Assurance Inspector before physical quarantine.
            </p>
          </div>

          <div>
            <h5 className="font-heading font-bold text-white mb-1">3. Privacy &amp; Air-Gapped Operation</h5>
            <p className="text-muted">
              AGNIVEDH runs 100% locally from offline files or an on-premises FastAPI server. Zero external API calls, tracking beacons, or third-party telemetry are transmitted.
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}
