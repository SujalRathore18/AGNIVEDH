import { BRANDING } from './constants'
import {
  AnalysisSummary,
  AppBranding,
  BatchSummary,
  DatasetMeta,
  DatasetValidationReport,
  Decision,
  EvaluationMetrics,
  LayerName,
  ModelInfo,
  PartRecord,
  ApiError,
} from './types'
import {
  generateNewSynthetic,
  getMockState,
  parseAndIngestCSV,
  recordInspectorOverride,
  resetMockToDemo,
  switchModelType,
} from './mock/state'
import { answerAgnivedhQuery, AssistantResponse } from './mock/assistant'

export interface PartsQueryParams {
  page?: number
  pageSize?: number
  decision?: Decision | 'ALL'
  batch?: string
  layer?: LayerName | 'ALL'
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedPartsResult {
  parts: PartRecord[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface JobStatusResponse {
  job_id: string
  dataset_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress_pct: number
  message: string
}

export interface AgnivedhApiClient {
  isMock(): boolean
  getMeta(): Promise<AppBranding>
  getHealth(): Promise<{ status: string; version: string; uptime_sec: number }>
  getDatasets(): Promise<DatasetMeta[]>
  getDatasetById(id: string): Promise<DatasetMeta>
  uploadCSV(csvText: string, datasheetLimit_uA?: number): Promise<{ dataset_id: string; report: DatasetValidationReport }>
  generateSynthetic(seed: number, batchCount: number, datasheetLimit_uA?: number): Promise<{ dataset_id: string }>
  triggerAnalysis(dataset_id: string): Promise<{ job_id: string }>
  getJobStatus(job_id: string): Promise<JobStatusResponse>
  getSummary(dataset_id: string): Promise<AnalysisSummary>
  getBatches(dataset_id: string): Promise<BatchSummary[]>
  getBatchById(batch_id: string): Promise<BatchSummary>
  getParts(dataset_id: string, params?: PartsQueryParams): Promise<PaginatedPartsResult>
  getPartById(part_id: string): Promise<PartRecord>
  submitPartReview(
    part_id: string,
    inspectorName: string,
    action: 'CONFIRM' | 'OVERRIDE',
    newDecision: Decision,
    note: string
  ): Promise<PartRecord>
  getEvaluation(dataset_id: string): Promise<EvaluationMetrics>
  getModels(): Promise<ModelInfo[]>
  retrainModel(modelType: 'RIDGE' | 'LIGHTGBM'): Promise<ModelInfo>
  exportDecisions(dataset_id: string, format: 'json' | 'csv'): Promise<Blob>
  askAssistant(query: string): Promise<AssistantResponse>
  resetDemo(): Promise<void>
}

/**
 * Local Deterministic Mock Implementation
 * Works 100% offline without any external services or backend.
 */
export class MockApiClient implements AgnivedhApiClient {
  isMock() {
    return true
  }

  async getMeta(): Promise<AppBranding> {
    return BRANDING
  }

  async getHealth() {
    return { status: 'healthy', version: '1.0.0-mock-space-engine', uptime_sec: 4200 }
  }

  async getDatasets(): Promise<DatasetMeta[]> {
    const state = getMockState()
    return state.datasetsList
  }

  async getDatasetById(id: string): Promise<DatasetMeta> {
    const state = getMockState()
    const d = state.datasetsList.find((item) => item.id === id) || state.datasetsList[0]
    return d
  }

  async uploadCSV(csvText: string, datasheetLimit_uA = 50.0) {
    const { dataset, report } = parseAndIngestCSV(csvText, datasheetLimit_uA)
    return { dataset_id: dataset.id, report }
  }

  async generateSynthetic(seed: number, batchCount: number, datasheetLimit_uA = 50.0) {
    const dataset = generateNewSynthetic(seed, batchCount, datasheetLimit_uA)
    return { dataset_id: dataset.id }
  }

  async triggerAnalysis(dataset_id: string) {
    const jobId = `job-${Date.now()}`
    const state = getMockState()
    state.activeJob = {
      jobId,
      datasetId: dataset_id,
      status: 'running',
      progress: 0,
      message: 'Running multi-layer physics and statistical inference...',
    }
    return { job_id: jobId }
  }

  async getJobStatus(job_id: string): Promise<JobStatusResponse> {
    const state = getMockState()
    if (!state.activeJob || state.activeJob.jobId !== job_id) {
      return {
        job_id,
        dataset_id: state.currentDataset.id,
        status: 'completed',
        progress_pct: 100,
        message: 'Analysis completed successfully.',
      }
    }

    state.activeJob.progress = Math.min(100, state.activeJob.progress + 35)
    if (state.activeJob.progress >= 100) {
      state.activeJob.status = 'completed'
      state.activeJob.message = 'Analysis complete. Decisions and explanations generated.'
    }

    return {
      job_id,
      dataset_id: state.activeJob.datasetId,
      status: state.activeJob.status,
      progress_pct: state.activeJob.progress,
      message: state.activeJob.message,
    }
  }

  async getSummary(dataset_id: string): Promise<AnalysisSummary> {
    const state = getMockState()
    return state.currentDataset.summary
  }

  async getBatches(dataset_id: string): Promise<BatchSummary[]> {
    const state = getMockState()
    return state.currentDataset.batches
  }

  async getBatchById(batch_id: string): Promise<BatchSummary> {
    const state = getMockState()
    const found = state.currentDataset.batches.find((b) => b.batch_id === batch_id)
    if (!found) throw new Error(`Batch ${batch_id} not found`)
    return found
  }

  async getParts(dataset_id: string, params?: PartsQueryParams): Promise<PaginatedPartsResult> {
    const state = getMockState()
    let parts = [...state.currentDataset.parts]

    if (params?.decision && params.decision !== 'ALL') {
      parts = parts.filter((p) => p.decision === params.decision)
    }

    if (params?.batch && params.batch !== 'ALL') {
      parts = parts.filter((p) => p.batch_id === params.batch)
    }

    if (params?.layer && params.layer !== 'ALL') {
      parts = parts.filter((p) => p.triggered_layers.includes(params.layer as LayerName))
    }

    if (params?.search) {
      const q = params.search.toLowerCase()
      parts = parts.filter(
        (p) =>
          p.part_id.toLowerCase().includes(q) ||
          p.batch_id.toLowerCase().includes(q) ||
          p.part_type.toLowerCase().includes(q)
      )
    }

    if (params?.sortBy) {
      const sortKey = params.sortBy as keyof PartRecord
      const order = params.sortOrder === 'desc' ? -1 : 1
      parts.sort((a, b) => {
        const valA = a[sortKey]
        const valB = b[sortKey]
        if (typeof valA === 'number' && typeof valB === 'number') return (valA - valB) * order
        return String(valA || '').localeCompare(String(valB || '')) * order
      })
    }

    const page = params?.page || 1
    const pageSize = params?.pageSize || 15
    const total = parts.length
    const totalPages = Math.ceil(total / pageSize)
    const paginated = parts.slice((page - 1) * pageSize, page * pageSize)

    return {
      parts: paginated,
      total,
      page,
      pageSize,
      totalPages,
    }
  }

  async getPartById(part_id: string): Promise<PartRecord> {
    const state = getMockState()
    const found = state.currentDataset.parts.find((p) => p.part_id === part_id)
    if (!found) throw new Error(`Part ${part_id} not found`)
    return found
  }

  async submitPartReview(
    part_id: string,
    inspectorName: string,
    action: 'CONFIRM' | 'OVERRIDE',
    newDecision: Decision,
    note: string
  ): Promise<PartRecord> {
    return recordInspectorOverride(part_id, inspectorName, action, newDecision, note)
  }

  async getEvaluation(dataset_id: string): Promise<EvaluationMetrics> {
    const state = getMockState()
    return state.currentDataset.evaluation
  }

  async getModels(): Promise<ModelInfo[]> {
    const state = getMockState()
    return [state.currentModel]
  }

  async retrainModel(modelType: 'RIDGE' | 'LIGHTGBM'): Promise<ModelInfo> {
    return switchModelType(modelType)
  }

  async exportDecisions(dataset_id: string, format: 'json' | 'csv'): Promise<Blob> {
    const state = getMockState()
    const parts = state.currentDataset.parts

    if (format === 'json') {
      const data = parts.map((p) => ({
        part_id: p.part_id,
        batch_id: p.batch_id,
        part_type: p.part_type,
        decision: p.decision,
        confidence: p.confidence,
        baseline_uA: p.readings[0]?.current_uA,
        predicted_168h_uA: p.predicted_168h_uA,
        triggered_layers: p.triggered_layers,
        summary: p.reason_card.summary,
        audit_history: p.audit_history,
      }))
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    }

    // CSV format
    const headers = [
      'part_id',
      'batch_id',
      'part_type',
      'decision',
      'confidence',
      'baseline_uA',
      'reading_24h_uA',
      'predicted_168h_uA',
      'datasheet_limit_uA',
      'effective_limit_uA',
      'triggered_layers',
      'summary',
    ]
    const rows = parts.map((p) => [
      p.part_id,
      p.batch_id,
      p.part_type,
      p.decision,
      p.confidence,
      p.readings[0]?.current_uA ?? '',
      p.readings[1]?.current_uA ?? '',
      p.predicted_168h_uA ?? '',
      p.datasheet_limit_uA,
      p.effective_limit_uA,
      `"${p.triggered_layers.join(';')}"`,
      `"${p.reason_card.summary.replace(/"/g, '""')}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  }

  async askAssistant(query: string): Promise<AssistantResponse> {
    // Simulated scan latency for realism
    await new Promise((resolve) => setTimeout(resolve, 350))
    return answerAgnivedhQuery(query)
  }

  async resetDemo(): Promise<void> {
    resetMockToDemo()
  }
}

/**
 * Real HTTP API Client connecting to FastAPI backend
 */
export class HttpApiClient implements AgnivedhApiClient {
  private baseUrl: string
  private apiKey?: string

  constructor(baseUrl: string = 'http://localhost:8000/api/v1', apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.apiKey = apiKey
  }

  isMock() {
    return false
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {}),
      ...((options.headers as Record<string, string>) || {}),
    }

    try {
      const response = await fetch(url, { ...options, headers })
      if (!response.ok) {
        let errBody: { error?: ApiError } = {}
        try {
          errBody = await response.json()
        } catch {
          // fallback
        }
        throw new Error(
          errBody.error?.message || `HTTP ${response.status}: ${response.statusText}`
        )
      }
      return (await response.json()) as T
    } catch (err: any) {
      console.warn(`[AGNIVEDH API Error] ${path}:`, err)
      throw err
    }
  }

  async getMeta(): Promise<AppBranding> {
    try {
      const meta = await this.request<AppBranding>('/meta')
      return {
        name: meta.name?.toUpperCase() || BRANDING.name,
        full_title: meta.full_title || BRANDING.full_title,
        tagline: meta.tagline || BRANDING.tagline,
        footer_credit: meta.footer_credit || BRANDING.footer_credit,
      }
    } catch {
      return BRANDING
    }
  }

  async getHealth() {
    return this.request<{ status: string; version: string; uptime_sec: number }>('/health')
  }

  async getDatasets(): Promise<DatasetMeta[]> {
    return this.request<DatasetMeta[]>('/datasets')
  }

  async getDatasetById(id: string): Promise<DatasetMeta> {
    return this.request<DatasetMeta>(`/datasets/${id}`)
  }

  async uploadCSV(csvText: string, datasheetLimit_uA = 50.0) {
    return this.request<{ dataset_id: string; report: DatasetValidationReport }>('/datasets/upload', {
      method: 'POST',
      body: JSON.stringify({ csv_data: csvText, datasheet_limit_uA: datasheetLimit_uA }),
    })
  }

  async generateSynthetic(seed: number, batchCount: number, datasheetLimit_uA = 50.0) {
    return this.request<{ dataset_id: string }>('/synthetic/generate', {
      method: 'POST',
      body: JSON.stringify({ seed, batch_count: batchCount, datasheet_limit_uA: datasheetLimit_uA }),
    })
  }

  async triggerAnalysis(dataset_id: string) {
    return this.request<{ job_id: string }>(`/datasets/${dataset_id}/analyze`, {
      method: 'POST',
    })
  }

  async getJobStatus(job_id: string): Promise<JobStatusResponse> {
    return this.request<JobStatusResponse>(`/jobs/${job_id}`)
  }

  async getSummary(dataset_id: string): Promise<AnalysisSummary> {
    return this.request<AnalysisSummary>(`/datasets/${dataset_id}/summary`)
  }

  async getBatches(dataset_id: string): Promise<BatchSummary[]> {
    return this.request<BatchSummary[]>(`/datasets/${dataset_id}/batches`)
  }

  async getBatchById(batch_id: string): Promise<BatchSummary> {
    return this.request<BatchSummary>(`/batches/${batch_id}`)
  }

  async getParts(dataset_id: string, params?: PartsQueryParams): Promise<PaginatedPartsResult> {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.pageSize) q.set('page_size', String(params.pageSize))
    if (params?.decision) q.set('decision', params.decision)
    if (params?.batch) q.set('batch', params.batch)
    if (params?.layer) q.set('layer', params.layer)
    if (params?.search) q.set('search', params.search)
    if (params?.sortBy) q.set('sort_by', params.sortBy)
    if (params?.sortOrder) q.set('sort_order', params.sortOrder)

    return this.request<PaginatedPartsResult>(`/datasets/${dataset_id}/parts?${q.toString()}`)
  }

  async getPartById(part_id: string): Promise<PartRecord> {
    return this.request<PartRecord>(`/parts/${part_id}`)
  }

  async submitPartReview(
    part_id: string,
    inspectorName: string,
    action: 'CONFIRM' | 'OVERRIDE',
    newDecision: Decision,
    note: string
  ): Promise<PartRecord> {
    return this.request<PartRecord>(`/parts/${part_id}/review`, {
      method: 'POST',
      body: JSON.stringify({
        inspector_name: inspectorName,
        action,
        new_decision: newDecision,
        note,
      }),
    })
  }

  async getEvaluation(dataset_id: string): Promise<EvaluationMetrics> {
    return this.request<EvaluationMetrics>(`/datasets/${dataset_id}/evaluation`)
  }

  async getModels(): Promise<ModelInfo[]> {
    return this.request<ModelInfo[]>('/models')
  }

  async retrainModel(modelType: 'RIDGE' | 'LIGHTGBM'): Promise<ModelInfo> {
    return this.request<ModelInfo>('/models/retrain', {
      method: 'POST',
      body: JSON.stringify({ model_type: modelType }),
    })
  }

  async exportDecisions(dataset_id: string, format: 'json' | 'csv'): Promise<Blob> {
    const url = `${this.baseUrl}/datasets/${dataset_id}/export?format=${format}`
    const response = await fetch(url, {
      headers: {
        ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {}),
      },
    })
    return response.blob()
  }

  async askAssistant(query: string): Promise<AssistantResponse> {
    // For assistant, query backend or fall back to dataset rule-engine
    try {
      return await this.request<AssistantResponse>('/assistant/probe', {
        method: 'POST',
        body: JSON.stringify({ query }),
      })
    } catch {
      // Graceful client fallback
      return answerAgnivedhQuery(query)
    }
  }

  async resetDemo(): Promise<void> {
    // No-op or trigger reload
  }
}

// Global API instance factory
let clientInstance: AgnivedhApiClient | null = null

export function getApiClient(): AgnivedhApiClient {
  if (clientInstance) return clientInstance

  const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
  const apiKey = process.env.NEXT_PUBLIC_API_KEY

  if (useMock) {
    clientInstance = new MockApiClient()
  } else {
    clientInstance = new HttpApiClient(baseUrl, apiKey)
  }

  return clientInstance
}

// Runtime toggle for user testing in the navbar
export function switchApiMode(mode: 'mock' | 'real'): AgnivedhApiClient {
  if (mode === 'mock') {
    clientInstance = new MockApiClient()
  } else {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    clientInstance = new HttpApiClient(baseUrl, apiKey)
  }
  return clientInstance
}
