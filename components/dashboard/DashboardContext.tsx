'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getApiClient } from '@/lib/api'
import { AnalysisSummary, BatchSummary, DatasetMeta, DatasetValidationReport, EvaluationMetrics, ModelInfo, PartRecord } from '@/lib/types'
import { useToast } from '@/components/ui/Toast'

interface DashboardContextType {
  currentDataset: DatasetMeta | null
  summary: AnalysisSummary | null
  batches: BatchSummary[]
  parts: PartRecord[]
  evaluation: EvaluationMetrics | null
  models: ModelInfo[]
  isLoading: boolean
  isAnalyzing: boolean
  analysisProgress: number
  analysisMessage: string
  refreshData: () => Promise<void>
  loadDemoData: () => Promise<void>
  generateSynthetic: (seed: number, batchCount: number, limit: number) => Promise<void>
  uploadCSV: (csvText: string, limit: number) => Promise<DatasetValidationReport>
  runAnalysis: () => Promise<void>
  exportDecisions: (format: 'json' | 'csv') => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast()
  const [currentDataset, setCurrentDataset] = useState<DatasetMeta | null>(null)
  const [summary, setSummary] = useState<AnalysisSummary | null>(null)
  const [batches, setBatches] = useState<BatchSummary[]>([])
  const [parts, setParts] = useState<PartRecord[]>([])
  const [evaluation, setEvaluation] = useState<EvaluationMetrics | null>(null)
  const [models, setModels] = useState<ModelInfo[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [analysisProgress, setAnalysisProgress] = useState<number>(0)
  const [analysisMessage, setAnalysisMessage] = useState<string>('')

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true)
      const client = getApiClient()
      const datasets = await client.getDatasets()
      if (datasets.length > 0) {
        const active = datasets[0]
        setCurrentDataset(active)

        const [s, b, pRes, ev, m] = await Promise.all([
          client.getSummary(active.id),
          client.getBatches(active.id),
          client.getParts(active.id, { pageSize: 500 }),
          client.getEvaluation(active.id),
          client.getModels(),
        ])

        setSummary(s)
        setBatches(b)
        setParts(pRes.parts)
        setEvaluation(ev)
        setModels(m)
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err)
      addToast(err.message || 'Error fetching telemetry dataset', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const loadDemoData = async () => {
    try {
      setIsLoading(true)
      const client = getApiClient()
      await client.resetDemo()
      await refreshData()
      addToast('Demo burn-in dataset loaded (Lot #42 with B-01 through B-05)', 'success', 'Dataset Reset')
    } catch (err: any) {
      addToast(err.message || 'Failed to load demo dataset', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const generateSynthetic = async (seed: number, batchCount: number, limit: number) => {
    try {
      setIsLoading(true)
      const client = getApiClient()
      await client.generateSynthetic(seed, batchCount, limit)
      await refreshData()
      addToast(`Generated ${batchCount} synthetic batches (Seed: ${seed})`, 'success', 'Generation Complete')
    } catch (err: any) {
      addToast(err.message || 'Synthetic generation error', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const uploadCSV = async (csvText: string, limit: number): Promise<DatasetValidationReport> => {
    const client = getApiClient()
    const { report } = await client.uploadCSV(csvText, limit)
    await refreshData()
    addToast(`CSV Ingested: ${report.valid_rows} rows valid, ${report.dropped_rows} dropped`, 'info', 'Validation Complete')
    return report
  }

  const runAnalysis = async () => {
    if (!currentDataset) return
    try {
      setIsAnalyzing(true)
      setAnalysisProgress(10)
      setAnalysisMessage('Initiating multi-layer burn-in screening...')

      const client = getApiClient()
      const { job_id } = await client.triggerAnalysis(currentDataset.id)

      // Poll job progress
      let done = false
      while (!done) {
        await new Promise((r) => setTimeout(r, 450))
        const status = await client.getJobStatus(job_id)
        setAnalysisProgress(status.progress_pct)
        setAnalysisMessage(status.message)

        if (status.status === 'completed' || status.status === 'failed') {
          done = true
        }
      }

      await refreshData()
      addToast('Multi-layer inference complete. All reason cards updated.', 'success', 'Analysis Succeeded')
    } catch (err: any) {
      addToast(err.message || 'Analysis execution failed', 'error')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const exportDecisions = async (format: 'json' | 'csv') => {
    if (!currentDataset) return
    try {
      const client = getApiClient()
      const blob = await client.exportDecisions(currentDataset.id, format)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `AGNIVEDH_decisions_${currentDataset.id}_${Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      addToast(`Downloaded decision report (${format.toUpperCase()})`, 'success')
    } catch (err: any) {
      addToast(err.message || 'Export failed', 'error')
    }
  }

  return (
    <DashboardContext.Provider
      value={{
        currentDataset,
        summary,
        batches,
        parts,
        evaluation,
        models,
        isLoading,
        isAnalyzing,
        analysisProgress,
        analysisMessage,
        refreshData,
        loadDemoData,
        generateSynthetic,
        uploadCSV,
        runAnalysis,
        exportDecisions,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
