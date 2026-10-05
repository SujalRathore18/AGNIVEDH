'use client'

import React, { useState } from 'react'
import { Play, Database, Upload, RefreshCw, FileText, Settings, Download, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useDashboard } from './DashboardContext'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { DatasetValidationReport } from '@/lib/types'

export const DatasetBar: React.FC = () => {
  const {
    currentDataset,
    isLoading,
    isAnalyzing,
    analysisProgress,
    analysisMessage,
    loadDemoData,
    generateSynthetic,
    uploadCSV,
    runAnalysis,
    exportDecisions,
  } = useDashboard()

  // Modal states
  const [generateModalOpen, setGenerateModalOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [activeReport, setActiveReport] = useState<DatasetValidationReport | null>(null)

  // Synthetic generator form state
  const [seed, setSeed] = useState(42)
  const [batchCount, setBatchCount] = useState(5)
  const [datasheetLimit, setDatasheetLimit] = useState(50.0)

  // CSV upload state
  const [csvContent, setCsvContent] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerateModalOpen(false)
    await generateSynthetic(seed, batchCount, datasheetLimit)
  }

  const handleCsvFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setCsvContent(text)
    }
    reader.readAsText(file)
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!csvContent) return
    setUploadModalOpen(false)
    const report = await uploadCSV(csvContent, datasheetLimit)
    setActiveReport(report)
    setReportModalOpen(true)
  }

  return (
    <div className="w-full bg-[#080E0B] border border-surface-border chamfer-md p-4 mb-6">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Dataset metadata pill */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#122219] text-[#39FF14] border border-[#39FF14]/30 chamfer-sm">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-muted font-bold">Active Lot:</span>
              <span className="text-xs font-heading font-bold text-white">
                {currentDataset?.name || 'Loading Lot Data…'}
              </span>
              <span className="text-[10px] font-mono px-1.5 bg-black text-[#39FF14] border border-[#39FF14]/30 chamfer-sm">
                {currentDataset?.source?.toUpperCase()}
              </span>
            </div>
            <div className="text-[11px] text-muted-dark font-space">
              {currentDataset?.total_parts || 0} parts across {currentDataset?.total_batches || 0} batches
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadDemoData}
            disabled={isLoading || isAnalyzing}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Load Demo Data
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGenerateModalOpen(true)}
            disabled={isLoading || isAnalyzing}
            leftIcon={<Settings className="w-3.5 h-3.5 text-[#39FF14]" />}
          >
            Generate Synthetic
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUploadModalOpen(true)}
            disabled={isLoading || isAnalyzing}
            leftIcon={<Upload className="w-3.5 h-3.5 text-cyan-400" />}
          >
            Upload CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            glow
            onClick={runAnalysis}
            loading={isAnalyzing}
            leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
          >
            Run Analysis
          </Button>

          {/* Export dropdown / buttons */}
          <div className="flex items-center gap-1 pl-2 border-l border-surface-border">
            <button
              onClick={() => exportDecisions('csv')}
              title="Download Decisions as CSV"
              className="px-2.5 py-1.5 bg-[#09150E] border border-surface-border chamfer-sm text-[11px] font-mono text-muted hover:text-white hover:border-[#39FF14]/50"
            >
              CSV
            </button>
            <button
              onClick={() => exportDecisions('json')}
              title="Download Decisions as JSON"
              className="px-2.5 py-1.5 bg-[#09150E] border border-surface-border chamfer-sm text-[11px] font-mono text-muted hover:text-white hover:border-[#39FF14]/50"
            >
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar when Analysis is Active */}
      {isAnalyzing && (
        <div className="mt-4 pt-3 border-t border-surface-border animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-[#39FF14] flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
              {analysisMessage}
            </span>
            <span className="text-white font-bold">{analysisProgress}%</span>
          </div>
          <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-[#39FF14]/30">
            <div
              className="h-full bg-gradient-to-r from-[#23a80d] to-[#39FF14] transition-all duration-300 shadow-[0_0_10px_#39FF14]"
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Modal: Generate Synthetic */}
      <Modal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        title="Generate Synthetic Lot Telemetry"
        description="Seeded burn-in simulation with lognormal physics and injected latent defects"
        maxWidth="md"
      >
        <form onSubmit={handleGenerateSubmit} className="space-y-4">
          <Input
            label="Random Seed (Deterministic)"
            type="number"
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value) || 42)}
          />
          <Input
            label="Number of Batches (1-5)"
            type="number"
            min="1"
            max="5"
            value={batchCount}
            onChange={(e) => setBatchCount(parseInt(e.target.value) || 5)}
          />
          <Input
            label="Datasheet Max Limit (µA)"
            type="number"
            step="1"
            value={datasheetLimit}
            onChange={(e) => setDatasheetLimit(parseFloat(e.target.value) || 50.0)}
          />
          <div className="text-[11px] text-muted font-space p-3 bg-black/40 border border-surface-border chamfer-sm">
            Note: Batch B-01 will include P-0007 (45 µA latent defect) and Batch B-04 will contain &lt; 30 parts to exercise low-confidence pooling.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setGenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Generate &amp; Ingest
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Upload CSV */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Ingest Burn-in CSV Lot"
        description="Drag & drop or paste your 0h, 24h, 48h, 96h, 168h leakage measurements"
        maxWidth="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              if (e.dataTransfer.files?.[0]) handleCsvFile(e.dataTransfer.files[0])
            }}
            className={`border-2 border-dashed chamfer-md p-6 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-[#39FF14] bg-[#39FF14]/5' : 'border-surface-border bg-black/40'
            }`}
          >
            <Upload className="w-8 h-8 text-muted mx-auto mb-2" />
            <p className="text-xs font-mono text-slate-200 mb-1">
              Drag and drop your .csv file here, or{' '}
              <label className="text-[#39FF14] underline cursor-pointer">
                browse files
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleCsvFile(e.target.files[0])}
                />
              </label>
            </p>
            <p className="text-[11px] text-muted font-space">
              Expected columns: part_id, batch_id, part_type, hour, current_uA
            </p>
          </div>

          <div>
            <label className="text-xs font-mono text-muted uppercase block mb-1">
              Or Paste CSV Data Directly:
            </label>
            <textarea
              rows={4}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="part_id,batch_id,part_type,hour,current_uA&#10;P-0001,B-01,RAD-OPAMP,0,10.2&#10;P-0001,B-01,RAD-OPAMP,24,10.4"
              className="w-full bg-[#080E0B] border border-surface-border chamfer-sm text-xs font-mono p-3 text-slate-100"
            />
          </div>

          <Input
            label="Datasheet Max Limit (µA)"
            type="number"
            step="1"
            value={datasheetLimit}
            onChange={(e) => setDatasheetLimit(parseFloat(e.target.value) || 50.0)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={!csvContent.trim()}>
              Upload &amp; Validate
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Validation Report */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Lot Ingestion Validation Report"
        description="Data integrity review and physics sanity checks"
        maxWidth="md"
      >
        {activeReport && (
          <div className="space-y-4 text-xs font-space">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-black/40 border border-surface-border chamfer-sm text-center">
                <span className="text-[10px] font-mono text-muted uppercase block">Total Rows</span>
                <span className="text-lg font-heading font-bold text-white">{activeReport.total_rows}</span>
              </div>
              <div className="p-3 bg-black/40 border border-[#39FF14]/30 chamfer-sm text-center">
                <span className="text-[10px] font-mono text-muted uppercase block">Valid Points</span>
                <span className="text-lg font-heading font-bold text-[#39FF14]">{activeReport.valid_rows}</span>
              </div>
              <div className="p-3 bg-black/40 border border-reject/30 chamfer-sm text-center">
                <span className="text-[10px] font-mono text-muted uppercase block">Dropped Rows</span>
                <span className="text-lg font-heading font-bold text-reject">{activeReport.dropped_rows}</span>
              </div>
            </div>

            {activeReport.warnings.length > 0 && (
              <div className="p-3 bg-[#161008] border border-amber/40 chamfer-sm">
                <span className="font-mono font-bold text-amber text-[11px] uppercase block mb-1">
                  Validation Warnings:
                </span>
                <ul className="space-y-1 text-slate-300">
                  {activeReport.warnings.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#FF9F1C] shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeReport.dropped_reasons.length > 0 && (
              <div>
                <span className="font-mono text-muted text-[11px] uppercase block mb-1">
                  Sample Dropped Rows:
                </span>
                <div className="max-h-24 overflow-y-auto space-y-1 font-mono text-[10px] text-reject">
                  {activeReport.dropped_reasons.map((dr, idx) => (
                    <div key={idx} className="p-1 bg-black/50 border border-reject/20">
                      Row {dr.row}: {dr.reason}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setReportModalOpen(false)
                  runAnalysis()
                }}
              >
                Proceed &amp; Run Analysis
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
