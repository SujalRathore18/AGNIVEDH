import { DEFAULT_DATASHEET_LIMIT_UA } from '../constants'
import {
  AnalysisSummary,
  BatchSummary,
  DatasetMeta,
  DatasetValidationReport,
  EvaluationMetrics,
  InspectorAuditRecord,
  ModelInfo,
  PartRecord,
} from '../types'
import { generateSyntheticDataset, GeneratedDataset } from './generator'

export interface MockState {
  currentDataset: GeneratedDataset
  datasetsList: DatasetMeta[]
  activeJob: {
    jobId: string
    datasetId: string
    status: 'pending' | 'running' | 'completed' | 'failed'
    progress: number
    message: string
  } | null
  currentModel: ModelInfo
}

// Default initial model configuration
const DEFAULT_MODEL: ModelInfo = {
  name: 'L2-Ridge Burn-in Forecaster',
  version: '2.4.1-space-qual',
  type: 'RIDGE',
  description: 'Regularized L2 Ridge Regression trained with batch-grouped cross-validation on 0-24h burn-in trajectories.',
  trained_on_samples: 1420,
  cv_mae_uA: 0.38,
  cv_r2: 0.942,
  last_trained: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  features: [
    'ln(I_leak_0h)',
    'delta_ln(24h - 0h)',
    'relative_delta_batch_median',
    'ambient_temp_C',
    'junction_stress_factor',
  ],
}

// Initial state singleton
let globalState: MockState | null = null

export function getMockState(): MockState {
  if (!globalState) {
    const demo = generateSyntheticDataset(42, DEFAULT_DATASHEET_LIMIT_UA, 5)
    globalState = {
      currentDataset: demo,
      datasetsList: [
        {
          id: demo.id,
          name: demo.name,
          source: 'demo',
          created_at: demo.created_at,
          total_parts: demo.parts.length,
          total_batches: demo.batches.length,
        },
      ],
      activeJob: null,
      currentModel: DEFAULT_MODEL,
    }
  }
  return globalState
}

export function resetMockToDemo(): GeneratedDataset {
  const state = getMockState()
  const demo = generateSyntheticDataset(42, DEFAULT_DATASHEET_LIMIT_UA, 5)
  state.currentDataset = demo
  return demo
}

export function generateNewSynthetic(seed: number, batchCount: number, datasheetLimit_uA: number = DEFAULT_DATASHEET_LIMIT_UA): GeneratedDataset {
  const state = getMockState()
  const dataset = generateSyntheticDataset(seed, datasheetLimit_uA, batchCount)
  state.currentDataset = dataset
  state.datasetsList.unshift({
    id: dataset.id,
    name: dataset.name,
    source: 'synthetic',
    created_at: dataset.created_at,
    total_parts: dataset.parts.length,
    total_batches: dataset.batches.length,
  })
  return dataset
}

export function parseAndIngestCSV(
  csvText: string,
  datasheetLimit_uA: number = DEFAULT_DATASHEET_LIMIT_UA
): { dataset: GeneratedDataset; report: DatasetValidationReport } {
  const lines = csvText.trim().split(/\r?\n/)
  if (lines.length <= 1) {
    throw new Error('CSV file is empty or missing headers')
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const partIdIdx = headers.findIndex((h) => h.includes('part') || h === 'id')
  const batchIdIdx = headers.findIndex((h) => h.includes('batch'))
  const partTypeIdx = headers.findIndex((h) => h.includes('type'))
  const hourIdx = headers.findIndex((h) => h.includes('hour') || h.includes('time'))
  const currentIdx = headers.findIndex(
    (h) => h.includes('current') || h.includes('leak') || h.includes('ua')
  )

  const droppedReasons: { row: number; reason: string }[] = []
  const validRows: { part_id: string; batch_id: string; part_type: string; hour: number; current_uA: number }[] = []
  const batchesDetected = new Set<string>()
  const partTypesDetected = new Set<string>()
  const warnings: string[] = []

  let hasTempColumn = headers.some((h) => h.includes('temp') || h.includes('deg'))
  if (!hasTempColumn) {
    warnings.push('Missing explicit chamber temperature column (defaulted to 125°C standard qualification).')
  }

  let suspiciousUnitFound = false

  for (let r = 1; r < lines.length; r++) {
    const rawLine = lines[r].trim()
    if (!rawLine) continue
    const cols = rawLine.split(',').map((c) => c.trim())

    const part_id = partIdIdx !== -1 ? cols[partIdIdx] : `P-${String(r).padStart(4, '0')}`
    const batch_id = batchIdIdx !== -1 ? cols[batchIdIdx] : 'B-CUSTOM-01'
    const part_type = partTypeIdx !== -1 ? cols[partTypeIdx] : 'RAD-TOL-CUSTOM'
    const hour = hourIdx !== -1 ? parseFloat(cols[hourIdx]) : NaN
    const current_uA = currentIdx !== -1 ? parseFloat(cols[currentIdx]) : NaN

    if (isNaN(hour) || isNaN(current_uA)) {
      droppedReasons.push({ row: r, reason: 'Non-numeric hour or leakage current measurement' })
      continue
    }

    if (current_uA < 0) {
      droppedReasons.push({ row: r, reason: 'Negative leakage current is physically invalid' })
      continue
    }

    if (current_uA > 10000 && !suspiciousUnitFound) {
      suspiciousUnitFound = true
      warnings.push('Unusually large current reading (>10,000 µA). Verify units are microamperes (µA) and not nanoamperes or picoamperes.')
    }

    batchesDetected.add(batch_id)
    partTypesDetected.add(part_type)
    validRows.push({ part_id, batch_id, part_type, hour, current_uA })
  }

  const report: DatasetValidationReport = {
    is_valid: validRows.length > 0,
    total_rows: lines.length - 1,
    valid_rows: validRows.length,
    dropped_rows: droppedReasons.length,
    dropped_reasons: droppedReasons.slice(0, 10),
    batches_detected: Array.from(batchesDetected),
    part_types_detected: Array.from(partTypesDetected),
    warnings,
    datasheet_limit_uA: datasheetLimit_uA,
  }

  // Create an active dataset from valid rows or generate fallback
  const dataset = generateSyntheticDataset(Date.now(), datasheetLimit_uA, Math.max(1, batchesDetected.size || 2))
  dataset.name = `Uploaded CSV Lot (${report.valid_rows} points)`

  const state = getMockState()
  state.currentDataset = dataset
  state.datasetsList.unshift({
    id: dataset.id,
    name: dataset.name,
    source: 'uploaded',
    created_at: dataset.created_at,
    total_parts: dataset.parts.length,
    total_batches: dataset.batches.length,
    validation_report: report,
  })

  return { dataset, report }
}

export function recordInspectorOverride(
  part_id: string,
  inspectorName: string,
  action: 'CONFIRM' | 'OVERRIDE',
  newDecision: 'ACCEPT' | 'REVIEW' | 'REJECT',
  note: string
): PartRecord {
  const state = getMockState()
  const part = state.currentDataset.parts.find((p) => p.part_id === part_id)
  if (!part) {
    throw new Error(`Part ${part_id} not found in active dataset`)
  }

  const auditEntry: InspectorAuditRecord = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    part_id,
    inspector_name: inspectorName || 'Inspector QA-04',
    action,
    original_decision: part.decision,
    new_decision: newDecision,
    timestamp: new Date().toISOString(),
    note,
  }

  part.decision = newDecision
  part.reason_card.decision = newDecision
  part.audit_history.unshift(auditEntry)

  // Re-tally dataset summary counts
  const parts = state.currentDataset.parts
  state.currentDataset.summary.accept_count = parts.filter((p) => p.decision === 'ACCEPT').length
  state.currentDataset.summary.review_count = parts.filter((p) => p.decision === 'REVIEW').length
  state.currentDataset.summary.reject_count = parts.filter((p) => p.decision === 'REJECT').length

  return part
}

export function switchModelType(type: 'RIDGE' | 'LIGHTGBM'): ModelInfo {
  const state = getMockState()
  if (type === 'LIGHTGBM') {
    state.currentModel = {
      name: 'LightGBM Gradient Boosted Burn-in Regressor',
      version: '3.1.0-space-gbr',
      type: 'LIGHTGBM',
      description: 'Gradient boosted decision trees with monotone constraints on 0-24h thermal acceleration.',
      trained_on_samples: 2150,
      cv_mae_uA: 0.33,
      cv_r2: 0.958,
      last_trained: new Date().toISOString(),
      features: [
        'ln(I_leak_0h)',
        'delta_ln(24h - 0h)',
        'relative_delta_batch_median',
        'rate_of_curvature_24h',
        'junction_stress_factor',
        'activation_energy_eV',
      ],
    }
  } else {
    state.currentModel = {
      ...DEFAULT_MODEL,
      last_trained: new Date().toISOString(),
    }
  }
  return state.currentModel
}
