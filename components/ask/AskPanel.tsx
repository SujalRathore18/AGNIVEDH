'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Send, Sparkles, AlertCircle, RefreshCw, Cpu, CheckCircle2, ChevronRight, Activity } from 'lucide-react'
import { getApiClient } from '@/lib/api'
import { AssistantResponse } from '@/lib/mock/assistant'
import { Button } from '@/components/ui/Button'
import { SuggestionChip } from '@/components/ui/SuggestionChip'
import { VedhMascot, VedhExpression } from '@/components/mascot/VedhMascot'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatMicroAmps } from '@/lib/utils'

interface AskPanelProps {
  onExpressionChange?: (exp: VedhExpression) => void
  initialQuery?: string
}

export const AskPanel: React.FC<AskPanelProps> = ({ onExpressionChange, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery)
  const [status, setStatus] = useState<'empty' | 'loading' | 'response' | 'error'>('empty')
  const [result, setResult] = useState<AssistantResponse | null>(null)
  const [displayedText, setDisplayedText] = useState('')
  const [mascotState, setMascotState] = useState<VedhExpression>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const typewriterRef = useRef<NodeJS.Timeout | null>(null)

  const suggestionChips = [
    'Why was part P-0007 flagged?',
    'Which batches are risky?',
    'Is 45 µA safe in a 10 µA batch?',
    'Show parts that drift faster than their batch',
    'What does low confidence mean?',
  ]

  const updateExpression = (exp: VedhExpression) => {
    setMascotState(exp)
    if (onExpressionChange) onExpressionChange(exp)
  }

  const handleProbe = async (customQuery?: string) => {
    const q = (customQuery !== undefined ? customQuery : query).trim()
    if (!q) return

    setQuery(q)
    setStatus('loading')
    updateExpression('thinking')
    setDisplayedText('')

    try {
      const client = getApiClient()
      const resp = await client.askAssistant(q)
      setResult(resp)
      setStatus('response')

      // Set mascot expression based on the result
      if (resp.partDetails) {
        if (resp.partDetails.decision === 'REJECT') updateExpression('alert')
        else if (resp.partDetails.decision === 'REVIEW') updateExpression('alert')
        else updateExpression('happy')
      } else if (resp.intent === 'safety_question') {
        updateExpression('alert')
      } else {
        updateExpression('idle')
      }

      // Typewriter effect
      let charIdx = 0
      const fullText = resp.answer
      if (typewriterRef.current) clearInterval(typewriterRef.current)

      // Respect prefers-reduced-motion: if reduced, show instantly
      const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (isReduced) {
        setDisplayedText(fullText)
        return
      }

      typewriterRef.current = setInterval(() => {
        charIdx += 2
        setDisplayedText(fullText.slice(0, charIdx))
        if (charIdx >= fullText.length) {
          if (typewriterRef.current) clearInterval(typewriterRef.current)
        }
      }, 12)
    } catch (err: any) {
      setStatus('error')
      setErrorMessage(err.message || 'Error communicating with reasoning engine.')
      updateExpression('alert')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleProbe()
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-6">
      {/* Top Input Bar */}
      <div className="relative bg-[#070D0A]/95 border-2 border-[#39FF14]/40 chamfer-lg p-3 sm:p-4 shadow-[0_0_30px_rgba(57,255,20,0.15)] transition-all duration-300 focus-within:border-[#39FF14] focus-within:shadow-[0_0_35px_rgba(57,255,20,0.3)]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 relative flex items-center">
            <span className="text-[#39FF14] mr-2.5 font-mono text-base font-bold select-none pl-1">
              &gt;
            </span>
            <textarea
              rows={1}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a part, a batch, or a flag…"
              className="w-full bg-transparent text-slate-100 placeholder-muted text-sm sm:text-base font-space resize-none focus:outline-none py-1.5"
              aria-label="Ask AGNIVEDH input field"
            />
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setStatus('empty')
                  updateExpression('idle')
                }}
                className="text-xs text-muted hover:text-white px-2 py-1"
              >
                Clear
              </button>
            )}

            <Button
              onClick={() => handleProbe()}
              loading={status === 'loading'}
              size="md"
              glow
              leftIcon={<Sparkles className="w-4 h-4 text-black" />}
            >
              Probe
            </Button>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="mt-3 pt-3 border-t border-surface-border/50 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-mono uppercase text-muted shrink-0 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-[#39FF14]" /> Suggestions:
          </span>
          {suggestionChips.map((chip) => (
            <SuggestionChip
              key={chip}
              onClick={() => {
                setQuery(chip)
                handleProbe(chip)
              }}
            >
              {chip}
            </SuggestionChip>
          ))}
        </div>
      </div>

      {/* State Transitions: Response, Loading, or Error */}
      <div className="mt-4 transition-all duration-300">
        {status === 'loading' && (
          <div className="bg-[#080F0C] border border-[#39FF14]/30 chamfer-md p-6 text-center flex flex-col items-center justify-center animate-in fade-in duration-200">
            <div className="w-16 h-16 relative mb-3">
              <VedhMascot expression="thinking" size={64} showGlow={false} />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#39FF14] uppercase tracking-wider mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
              Scanning Multi-Layer Burn-in Telemetry…
            </div>
            <p className="text-xs text-muted font-space">
              Evaluating static limits, computing log-scale MAD outlier score, projecting 168h drift.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-[#160808] border border-reject/40 chamfer-md p-6 text-left flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-reject shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-heading font-bold text-white mb-1">Probe Execution Fault</h4>
              <p className="text-xs text-muted font-space mb-3">{errorMessage}</p>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleProbe()}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retry Probe
              </Button>
            </div>
          </div>
        )}

        {status === 'response' && result && (
          <div className="bg-[#080E0B] border border-[#39FF14]/40 chamfer-md p-6 shadow-[0_0_25px_rgba(57,255,20,0.12)] animate-in fade-in duration-300">
            {/* Header info */}
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-surface-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 shrink-0">
                  <VedhMascot expression={mascotState} size={32} showGlow={false} showBadge={false} />
                </div>
                <div>
                  <div className="text-xs font-heading font-bold text-slate-100 flex items-center gap-2">
                    <span>VEDH REASONING ENGINE</span>
                    <span className="text-[10px] font-mono text-[#39FF14] bg-[#39FF14]/10 px-2 py-0.2 border border-[#39FF14]/30 chamfer-sm">
                      DETERMINISTIC
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-muted truncate max-w-md">
                    Query: &quot;{result.query}&quot;
                  </div>
                </div>
              </div>

              {result.partDetails && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-300 font-bold">{result.partDetails.part_id}</span>
                  <StatusBadge status={result.partDetails.decision} size="sm" />
                </div>
              )}
            </div>

            {/* Typewriter Answer Text */}
            <div className="text-sm font-space text-slate-100 leading-relaxed min-h-[48px] bg-black/30 p-3.5 chamfer-sm border border-surface-border/50">
              {displayedText}
              {displayedText.length < result.answer.length && (
                <span className="inline-block w-2 h-4 bg-[#39FF14] ml-1 animate-pulse" />
              )}
            </div>

            {/* Inline Structured Reason Card Preview */}
            {result.reasonCard && (
              <div className="mt-4 pt-4 border-t border-surface-border">
                <div className="text-xs font-heading font-semibold text-slate-200 uppercase mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#39FF14]" />
                  Multi-Layer Verification Breakdown
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {result.reasonCard.layers.map((layer) => (
                    <div
                      key={layer.layer}
                      className={`p-3 chamfer-sm border text-xs font-space ${
                        layer.triggered
                          ? 'border-[#FF9F1C]/50 bg-[#161008]'
                          : 'border-surface-border bg-[#050A07]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono uppercase font-bold text-[11px] text-slate-300">
                          {layer.layer === 'static'
                            ? 'L1: Static Limit'
                            : layer.layer === 'batch_outlier'
                            ? 'L2: Batch Outlier (Mod A)'
                            : 'L3: Drift Forecast (Mod B)'}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.2 chamfer-sm ${
                            layer.triggered
                              ? 'bg-amber/20 text-[#FF9F1C] border border-amber/50'
                              : 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30'
                          }`}
                        >
                          {layer.triggered ? 'TRIGGERED' : 'PASS'}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted line-clamp-3">{layer.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Link to Full Part Detail */}
            {result.actionLink && (
              <div className="mt-4 pt-3 border-t border-surface-border/50 flex justify-end">
                <Link
                  href={result.actionLink.href}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#39FF14] hover:underline"
                >
                  <span>{result.actionLink.label}</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
