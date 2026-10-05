import { MIN_BATCH_SAMPLE_SIZE, MAD_FLOOR, DEFAULT_OUTLIER_THRESHOLD } from '../constants'
import { ConfidenceLevel, LayerResult } from '../types'
import { calculateMAD, calculateMedian, formatMicroAmps, formatNumber } from '../utils'

export interface BatchDistributionMetrics {
  median_uA: number
  median_ln: number
  mad_ln: number
  log_spread: number
  learned_limit_uA: number
  datasheet_limit_uA: number
  effective_limit_uA: number
  sample_size: number
  confidence: ConfidenceLevel
  is_pooled: boolean
}

/**
 * Computes batch distribution metrics on log-scale using MAD.
 * Learned limit formula: exp(median_ln + threshold * (1.4826 * MAD_ln))
 * Effective limit: min(learned_limit, datasheet_limit)
 */
export function computeBatchDistribution(
  readings_uA: number[],
  datasheet_limit_uA: number,
  threshold: number = DEFAULT_OUTLIER_THRESHOLD,
  forcePooled: boolean = false
): BatchDistributionMetrics {
  const sample_size = readings_uA.length
  const is_pooled = forcePooled || sample_size < MIN_BATCH_SAMPLE_SIZE
  const confidence: ConfidenceLevel = is_pooled ? 'low' : 'normal'

  // Work on ln scale (guarded against zero/negative)
  const ln_values = readings_uA.map((v) => Math.log(Math.max(v, 0.001)))
  const median_ln = calculateMedian(ln_values)
  const raw_mad = calculateMAD(ln_values, median_ln)
  const mad_ln = Math.max(raw_mad, MAD_FLOOR)
  const log_spread = 1.4826 * mad_ln

  const learned_limit_uA = Math.exp(median_ln + threshold * log_spread)
  const effective_limit_uA = Math.min(learned_limit_uA, datasheet_limit_uA)
  const median_uA = Math.exp(median_ln)

  return {
    median_uA,
    median_ln,
    mad_ln,
    log_spread,
    learned_limit_uA,
    datasheet_limit_uA,
    effective_limit_uA,
    sample_size,
    confidence,
    is_pooled,
  }
}

/**
 * Calculates Module A outlier score on ln scale:
 * score = (ln(x) - median_ln) / log_spread
 */
export function calculateOutlierScore(
  x_uA: number,
  median_ln: number,
  log_spread: number
): number {
  const ln_x = Math.log(Math.max(x_uA, 0.001))
  return (ln_x - median_ln) / log_spread
}

/**
 * Evaluates Module A for an individual part against its batch distribution.
 */
export function evaluateModuleA(
  baseline_uA: number,
  batchMetrics: BatchDistributionMetrics,
  threshold: number = DEFAULT_OUTLIER_THRESHOLD
): LayerResult {
  const score = calculateOutlierScore(
    baseline_uA,
    batchMetrics.median_ln,
    batchMetrics.log_spread
  )

  const triggered = score > threshold || baseline_uA > batchMetrics.effective_limit_uA

  const scoreFormatted = formatNumber(score, 1)
  const baselineFormatted = formatMicroAmps(baseline_uA)
  const medianFormatted = formatMicroAmps(batchMetrics.median_uA)
  const limitFormatted = formatMicroAmps(batchMetrics.effective_limit_uA)

  let detail = ''
  if (triggered) {
    detail = `Baseline leakage ${baselineFormatted} is anomalous (MAD score ${scoreFormatted} vs threshold ${threshold.toFixed(1)}). Exceeds batch learned limit of ${limitFormatted} (batch median: ${medianFormatted}).`
  } else {
    detail = `Baseline leakage ${baselineFormatted} conforms to batch (MAD score ${scoreFormatted} <= ${threshold.toFixed(1)}, below effective limit ${limitFormatted}).`
  }

  if (batchMetrics.confidence === 'low') {
    detail += ` [Batch size ${batchMetrics.sample_size} < 30: pooled reference applied, low confidence].`
  }

  return {
    layer: 'batch_outlier',
    triggered,
    score: Number(score.toFixed(2)),
    effective_limit_uA: Number(batchMetrics.effective_limit_uA.toFixed(2)),
    batch_median_uA: Number(batchMetrics.median_uA.toFixed(2)),
    detail,
  }
}
