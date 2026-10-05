import { ConfidenceLevel, Decision, LayerName, LayerResult, ReasonCardData } from '../types'
import { formatMicroAmps } from '../utils'

export interface MakeDecisionInput {
  part_id: string
  staticResult: LayerResult
  moduleAResult: LayerResult
  moduleBResult: LayerResult
  datasheetLimit_uA: number
  batchConfidence: ConfidenceLevel
  warnings: string[]
  isEarlyFail?: boolean
}

export interface DecisionResult {
  decision: Decision
  confidence: ConfidenceLevel
  triggeredLayers: LayerName[]
  reasonCard: ReasonCardData
}

export function synthesizeDecision(input: MakeDecisionInput): DecisionResult {
  const {
    part_id,
    staticResult,
    moduleAResult,
    moduleBResult,
    datasheetLimit_uA,
    batchConfidence,
    warnings: extraWarnings,
    isEarlyFail,
  } = input

  const layers: LayerResult[] = [staticResult, moduleAResult, moduleBResult]
  const triggeredLayers: LayerName[] = layers
    .filter((l) => l.triggered)
    .map((l) => l.layer)

  const warnings = [...extraWarnings]

  if (batchConfidence === 'low') {
    warnings.push('Batch sample size is below statistical threshold (<30 parts). Evaluation relies on cross-batch pooling.')
  }

  // Check if upper prediction bound breaches datasheet
  const upperDriftExceedsDatasheet =
    moduleBResult.range_uA && moduleBResult.range_uA[1] > datasheetLimit_uA

  // Decision rules
  let decision: Decision = 'ACCEPT'

  if (isEarlyFail || staticResult.triggered) {
    decision = 'REJECT'
  } else if (triggeredLayers.length >= 2) {
    // 2+ layers object
    decision = 'REJECT'
  } else if (upperDriftExceedsDatasheet) {
    decision = 'REJECT'
  } else if (triggeredLayers.length === 1) {
    // Exactly one layer objects -> quarantine for inspector review
    decision = 'REVIEW'
  } else if (batchConfidence === 'low' || warnings.length > 0) {
    // Low confidence or consistency warning
    decision = 'REVIEW'
  } else {
    decision = 'ACCEPT'
  }

  // Construct structured plain-English summary
  let summary = ''
  if (isEarlyFail) {
    summary = `Part experienced catastrophic early failure prior to burn-in stabilization.`
  } else if (decision === 'REJECT') {
    if (staticResult.triggered) {
      summary = `Reject: Static leakage directly breaches the absolute datasheet ceiling of ${formatMicroAmps(datasheetLimit_uA)}.`
    } else if (upperDriftExceedsDatasheet) {
      summary = `Reject: 168-hour drift projection indicates severe latent risk, with upper bound (${formatMicroAmps(moduleBResult.range_uA?.[1])}) breaching the ${formatMicroAmps(datasheetLimit_uA)} datasheet limit.`
    } else {
      summary = `Reject: Multi-layer consensus failure across ${triggeredLayers.join(' and ')} indicates compound degradation.`
    }
  } else if (decision === 'REVIEW') {
    if (moduleAResult.triggered) {
      summary = `Review: Baseline leakage (${formatMicroAmps(moduleAResult.batch_median_uA ? moduleAResult.score : undefined)}) exceeds batch learned limit (${formatMicroAmps(moduleAResult.effective_limit_uA)}) despite being under datasheet limit.`
    } else if (moduleBResult.triggered) {
      summary = `Review: Accelerated 0-24h drift velocity detected. Projected 168h leakage (${formatMicroAmps(moduleBResult.predicted_168h_uA)}) deviates from peer cohort.`
    } else if (batchConfidence === 'low') {
      summary = `Review: Sub-threshold batch sample size (<30 parts). Pooled model applied; flagged for manual inspector verification.`
    } else if (warnings.length > 0) {
      summary = `Review: Trajectory consistency alert detected during 96h check.`
    }
  } else {
    summary = `Accept: Part exhibits nominal leakage and stable drift well within batch statistical bounds and datasheet limits.`
  }

  // Inspector action recommendations
  const what_to_check: string[] = []
  if (moduleAResult.triggered) {
    what_to_check.push('Inspect die surface for micro-cracks or localized metallization bridges causing baseline elevation.')
    what_to_check.push('Verify test socket contact resistance and verify adjacent pin isolation.')
  }
  if (moduleBResult.triggered) {
    what_to_check.push('Check thermal chamber thermocouple log for localized temperature gradient during initial 24h ramp.')
    what_to_check.push('Conduct curve-tracer breakdown voltage measurement to rule out gate oxide pinhole wear-out.')
  }
  if (upperDriftExceedsDatasheet) {
    what_to_check.push('Run extended 48h soak at rated junction temperature to confirm whether drift plateaus or runs away.')
  }
  if (batchConfidence === 'low') {
    what_to_check.push('Compare lot trace against historical wafer fabrication lots of identical die type.')
  }
  if (what_to_check.length === 0) {
    what_to_check.push('Proceed with standard post-burn-in functional test sequence.')
  }

  const reasonCard: ReasonCardData = {
    part_id,
    decision,
    confidence: batchConfidence,
    summary,
    layers,
    what_to_check,
    warnings,
  }

  return {
    decision,
    confidence: batchConfidence,
    triggeredLayers,
    reasonCard,
  }
}

export function synthesizeBatchDecision(
  flaggedFraction: number,
  confidence: ConfidenceLevel,
  rejectCount: number
): { decision: Decision; reasons: string[] } {
  const reasons: string[] = []

  let decision: Decision = 'ACCEPT'

  if (rejectCount >= 3 || flaggedFraction > 0.15) {
    decision = 'REJECT'
    reasons.push(`High defect rate (${(flaggedFraction * 100).toFixed(1)}% flagged parts, ${rejectCount} hard rejects) indicates potential lot-level wafer fabrication or thermal stress anomaly.`)
  } else if (flaggedFraction > 0.04 || confidence === 'low') {
    decision = 'REVIEW'
    if (confidence === 'low') {
      reasons.push('Batch sample size is under 30 parts; statistical confidence is reduced. Manual engineering review required.')
    }
    if (flaggedFraction > 0.04) {
      reasons.push(`Elevated anomaly rate of ${(flaggedFraction * 100).toFixed(1)}% exceeds standard lot gate threshold.`)
    }
  } else {
    decision = 'ACCEPT'
    reasons.push(`Clean lot distribution: ${(flaggedFraction * 100).toFixed(1)}% flag rate within nominal ISRO burn-in acceptance limits.`)
  }

  return { decision, reasons }
}
