export type Decision = 'ACCEPT' | 'REVIEW' | 'REJECT'
export type ConfidenceLevel = 'normal' | 'low'
export type LayerName = 'static' | 'batch_outlier' | 'drift'

export interface PartReading {
  hour: number // 0, 24, 48, 96, 168
  current_uA: number // Leakage current in microamperes
}

export type DefectType = 'none' | 'high_from_start' | 'jump_first_24h' | 'faster_creep' | 'early_fail'

export interface GroundTruth {
  is_latent_defect: boolean
  defect_type: DefectType
  injection_notes?: string
}

export interface LayerResult {
  layer: LayerName
  triggered: boolean
  detail: string
  score?: number
  effective_limit_uA?: number
  batch_median_uA?: number
  predicted_168h_uA?: number
  range_uA?: [number, number]
}

export interface ReasonCardData {
  part_id: string
  decision: Decision
  confidence: ConfidenceLevel
  summary: string
  layers: LayerResult[]
  what_to_check: string[]
  warnings: string[]
}

export interface PartTrajectoryPoint {
  hour: number
  actual_uA?: number
  forecast_uA?: number
  forecast_lower_uA?: number
  forecast_upper_uA?: number
  batch_median_uA?: number
}

export interface InspectorAuditRecord {
  id: string
  part_id: string
  inspector_name: string
  action: 'CONFIRM' | 'OVERRIDE'
  original_decision: Decision
  new_decision: Decision
  timestamp: string
  note: string
}

export interface PartRecord {
  part_id: string
  batch_id: string
  part_type: string
  readings: PartReading[]
  readings_map: Record<number, number> // hour -> uA
  is_early_fail: boolean
  decision: Decision
  confidence: ConfidenceLevel
  triggered_layers: LayerName[]
  reason_card: ReasonCardData
  trajectory: PartTrajectoryPoint[]
  datasheet_limit_uA: number
  effective_limit_uA: number
  batch_median_uA: number
  predicted_168h_uA?: number
  prediction_range_uA?: [number, number]
  ground_truth?: GroundTruth // Evaluated offline, never fed as a feature!
  audit_history: InspectorAuditRecord[]
}

export interface BatchSummary {
  batch_id: string
  part_type: string
  total_parts: number
  median_uA: number
  mad_uA: number
  learned_limit_uA: number
  datasheet_limit_uA: number
  effective_limit_uA: number
  confidence: ConfidenceLevel
  decision: Decision
  flagged_count: number
  flagged_fraction: number
  decision_counts: {
    ACCEPT: number
    REVIEW: number
    REJECT: number
    EARLY_FAIL: number
  }
  reasons: string[]
  is_pooled: boolean
  distribution: {
    bins: { min: number; max: number; count: number }[]
    log_spread: number
  }
}

export interface CatchByLayerStats {
  static_only: number
  module_a_only: number
  module_b_only: number
  multi_layer: number
  total_flagged: number
}

export interface AnalysisSummary {
  dataset_id: string
  total_parts: number
  total_batches: number
  accept_count: number
  review_count: number
  reject_count: number
  early_fail_count: number
  low_confidence_batches: number
  layer_catch: {
    static_count: number
    module_a_count: number
    module_b_count: number
    all_combined: number
  }
  catch_breakdown: CatchByLayerStats
  decision_distribution: {
    name: Decision | 'EARLY_FAIL'
    value: number
    color: string
  }[]
  last_analyzed_at: string
}

export interface DefectMetricItem {
  defect_type: DefectType
  total_injected: number
  detected_count: number
  recall_pct: number
}

export interface EvaluationMetrics {
  total_evaluated_parts: number
  total_defects: number
  true_positives: number
  false_positives: number
  true_negatives: number
  false_negatives: number
  precision_pct: number
  recall_pct: number
  f1_score: number
  mae_drift_uA: number
  coverage_90pct_conformal: number
  defect_breakdown: DefectMetricItem[]
  disclaimer: string
}

export interface ModelInfo {
  name: string
  version: string
  type: 'RIDGE' | 'LIGHTGBM'
  description: string
  trained_on_samples: number
  cv_mae_uA: number
  cv_r2: number
  last_trained: string
  features: string[]
}

export interface DatasetValidationReport {
  is_valid: boolean
  total_rows: number
  valid_rows: number
  dropped_rows: number
  dropped_reasons: { row: number; reason: string }[]
  batches_detected: string[]
  part_types_detected: string[]
  warnings: string[]
  datasheet_limit_uA: number
}

export interface DatasetMeta {
  id: string
  name: string
  source: 'demo' | 'synthetic' | 'uploaded'
  created_at: string
  total_parts: number
  total_batches: number
  validation_report?: DatasetValidationReport
}

export interface AppBranding {
  name: string
  full_title: string
  tagline: string
  footer_credit: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}
