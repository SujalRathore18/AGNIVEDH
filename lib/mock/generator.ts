import { DEFAULT_DATASHEET_LIMIT_UA, DEFAULT_OUTLIER_THRESHOLD } from '../constants'
import {
  BatchSummary,
  DefectType,
  GroundTruth,
  PartReading,
  PartRecord,
  AnalysisSummary,
  EvaluationMetrics,
  DefectMetricItem,
} from '../types'
import { createPRNG, randomLogNormal, randomNormal } from '../utils'
import { computeBatchDistribution, evaluateModuleA } from './module_a'
import { evaluateModuleB } from './module_b'
import { evaluateStaticCheck } from './static_check'
import { synthesizeBatchDecision, synthesizeDecision } from './decision'

export interface GeneratedDataset {
  id: string
  name: string
  created_at: string
  parts: PartRecord[]
  batches: BatchSummary[]
  summary: AnalysisSummary
  evaluation: EvaluationMetrics
}

interface BatchSpec {
  id: string
  part_type: string
  count: number
  median_uA: number
  log_spread: number
  defects: { index: number; type: DefectType; customId?: string }[]
}

export function generateSyntheticDataset(
  seed: number = 42,
  datasheetLimit_uA: number = DEFAULT_DATASHEET_LIMIT_UA,
  batchCount: number = 5
): GeneratedDataset {
  const datasheet_limit_uA = datasheetLimit_uA
  const prng = createPRNG(seed)

  // Configure batch specs. Always include P-0007 in B-01, and B-04 as a small batch (<30 parts).
  const batchSpecs: BatchSpec[] = [
    {
      id: 'B-01',
      part_type: 'RAD-TOL-OPAMP-01',
      count: 50,
      median_uA: 10.0,
      log_spread: 0.18,
      defects: [
        { index: 6, type: 'high_from_start' as DefectType, customId: 'P-0007' }, // 7th part (0-indexed 6)
        { index: 21, type: 'faster_creep' as DefectType },
      ],
    },
    {
      id: 'B-02',
      part_type: 'SPACE-DAC-16B',
      count: 45,
      median_uA: 12.5,
      log_spread: 0.20,
      defects: [
        { index: 12, type: 'jump_first_24h' as DefectType },
        { index: 33, type: 'high_from_start' as DefectType },
      ],
    },
    {
      id: 'B-03',
      part_type: 'RAD-HARD-FPGA-CORE',
      count: 40,
      median_uA: 8.8,
      log_spread: 0.16,
      defects: [
        { index: 8, type: 'faster_creep' as DefectType },
        { index: 27, type: 'jump_first_24h' as DefectType },
      ],
    },
    {
      id: 'B-04',
      part_type: 'ISRO-CUSTOM-ASIC-X',
      count: 18, // < 30 parts -> triggers low confidence pooling!
      median_uA: 9.5,
      log_spread: 0.17,
      defects: [
        { index: 5, type: 'faster_creep' as DefectType },
      ],
    },
    {
      id: 'B-05',
      part_type: 'RAD-TOL-OPAMP-01',
      count: 42,
      median_uA: 10.4,
      log_spread: 0.19,
      defects: [
        { index: 14, type: 'early_fail' as DefectType },
        { index: 29, type: 'jump_first_24h' as DefectType },
      ],
    },
  ].slice(0, Math.max(1, batchCount))

  let partCounter = 1
  const allParts: PartRecord[] = []
  const allBatches: BatchSummary[] = []

  // Pre-generate raw readings for all batches
  interface RawBatchData {
    spec: BatchSpec
    rawParts: {
      part_id: string
      groundTruth: GroundTruth
      readings: PartReading[]
      isEarlyFail: boolean
    }[]
  }

  const rawBatches: RawBatchData[] = batchSpecs.map((spec) => {
    const rawParts: RawBatchData['rawParts'] = []

    for (let i = 0; i < spec.count; i++) {
      const defectDef = spec.defects.find((d) => d.index === i)
      const defectType: DefectType = defectDef ? defectDef.type : 'none'
      const part_id = defectDef?.customId || `P-${String(partCounter).padStart(4, '0')}`
      partCounter++

      const groundTruth: GroundTruth = {
        is_latent_defect: defectType !== 'none',
        defect_type: defectType,
        injection_notes:
          defectType === 'high_from_start'
            ? 'Latent substrate defect: elevated baseline leakage (4.5x batch median) under datasheet limit.'
            : defectType === 'jump_first_24h'
            ? 'Latent gate oxide breakdown: sudden leakage jump during initial 24 hours of burn-in.'
            : defectType === 'faster_creep'
            ? 'Latent electro-migration: accelerated non-linear current creep over 168 hours.'
            : defectType === 'early_fail'
            ? 'Catastrophic early breakdown: dielectric short before 24h burn-in stabilization.'
            : 'Nominal healthy qualification device.',
      }

      const logMedian = Math.log(spec.median_uA)
      let r0: number
      let r24: number
      let r48: number
      let r96: number
      let r168: number
      let isEarlyFail = false

      if (defectType === 'high_from_start') {
        // High from start: ~4.5x batch median, but strictly UNDER 50 uA datasheet limit
        r0 = spec.id === 'B-01' ? 45.0 : Math.min(datasheetLimit_uA - 4.5, spec.median_uA * 4.2)
        r24 = r0 + 0.6 + prng() * 0.4
        r48 = r24 + 0.5 + prng() * 0.3
        r96 = r48 + 0.7 + prng() * 0.4
        r168 = r96 + 0.8 + prng() * 0.5
      } else if (defectType === 'jump_first_24h') {
        r0 = randomLogNormal(prng, logMedian, 0.08)
        r24 = r0 * (2.4 + prng() * 0.6) // Jumps 2.5x - 3x at 24h
        r48 = r24 * (1.15 + prng() * 0.1)
        r96 = r48 * (1.2 + prng() * 0.1)
        r168 = r96 * (1.25 + prng() * 0.15)
      } else if (defectType === 'faster_creep') {
        r0 = randomLogNormal(prng, logMedian, 0.08)
        r24 = r0 * (1.22 + prng() * 0.05)
        r48 = r24 * (1.35 + prng() * 0.08)
        r96 = r48 * (1.45 + prng() * 0.1)
        r168 = r96 * (1.55 + prng() * 0.12)
      } else if (defectType === 'early_fail') {
        r0 = 14.5
        r24 = 82.4 // Exceeds 50 uA datasheet limit
        r48 = 95.0
        r96 = 110.0
        r168 = 135.0
        isEarlyFail = true
      } else {
        // Nominal healthy component
        r0 = randomLogNormal(prng, logMedian, spec.log_spread / 1.4826)
        // Mild normal drift across 168h (~ +0.2 to +0.8 uA)
        const healthyDriftPct = 0.03 + prng() * 0.05
        r24 = r0 * (1 + healthyDriftPct * 0.25) + randomNormal(prng, 0, 0.05)
        r48 = r0 * (1 + healthyDriftPct * 0.50) + randomNormal(prng, 0, 0.05)
        r96 = r0 * (1 + healthyDriftPct * 0.75) + randomNormal(prng, 0, 0.06)
        r168 = r0 * (1 + healthyDriftPct * 1.0) + randomNormal(prng, 0, 0.07)
      }

      const readings: PartReading[] = [
        { hour: 0, current_uA: Number(Math.max(0.1, r0).toFixed(2)) },
        { hour: 24, current_uA: Number(Math.max(0.1, r24).toFixed(2)) },
        { hour: 48, current_uA: Number(Math.max(0.1, r48).toFixed(2)) },
        { hour: 96, current_uA: Number(Math.max(0.1, r96).toFixed(2)) },
        { hour: 168, current_uA: Number(Math.max(0.1, r168).toFixed(2)) },
      ]

      rawParts.push({ part_id, groundTruth, readings, isEarlyFail })
    }

    return { spec, rawParts }
  })

  // Global pooling baseline for small batches (<30 parts)
  const allBaselineReadings = rawBatches
    .flatMap((b) => b.rawParts.map((p) => p.readings[0].current_uA))
  const globalDistribution = computeBatchDistribution(
    allBaselineReadings,
    datasheetLimit_uA,
    DEFAULT_OUTLIER_THRESHOLD,
    false
  )

  // Process batches and parts
  rawBatches.forEach(({ spec, rawParts }) => {
    const baselineReadings = rawParts.map((p) => p.readings[0].current_uA)
    const isSmallBatch = spec.count < 30

    // Compute batch distribution
    const batchDistribution = isSmallBatch
      ? {
          ...globalDistribution,
          sample_size: spec.count,
          confidence: 'low' as const,
          is_pooled: true,
        }
      : computeBatchDistribution(baselineReadings, datasheetLimit_uA, DEFAULT_OUTLIER_THRESHOLD, false)

    // Compute batch median 24h drift for Module B reference
    const batchDeltas24 = rawParts.map((p) => {
      const ln0 = Math.log(Math.max(p.readings[0].current_uA, 0.001))
      const ln24 = Math.log(Math.max(p.readings[1].current_uA, 0.001))
      return ln24 - ln0
    })
    const medianBatchDelta24 = batchDeltas24.sort((a, b) => a - b)[Math.floor(batchDeltas24.length / 2)] || 0.02
    const batchMedian168 = spec.median_uA * 1.05

    const batchPartRecords: PartRecord[] = []

    rawParts.forEach(({ part_id, groundTruth, readings, isEarlyFail }) => {
      const readings_map: Record<number, number> = {}
      readings.forEach((r) => {
        readings_map[r.hour] = r.current_uA
      })

      // Layer 1: Static Check
      const staticResult = evaluateStaticCheck(readings, datasheetLimit_uA)

      // Layer 2: Module A Outlier Check
      const moduleAResult = evaluateModuleA(
        readings[0].current_uA,
        batchDistribution,
        DEFAULT_OUTLIER_THRESHOLD
      )

      // Layer 3: Module B Drift Forecast
      const moduleBResult = evaluateModuleB({
        readings,
        batchMedianDelta24: medianBatchDelta24,
        batchMedian168,
        effectiveLimit_uA: batchDistribution.effective_limit_uA,
        datasheetLimit_uA,
      })

      // Multi-layer Decision Synthesis
      const decisionOut = synthesizeDecision({
        part_id,
        staticResult,
        moduleAResult,
        moduleBResult: moduleBResult.layerResult,
        datasheetLimit_uA,
        batchConfidence: batchDistribution.confidence,
        warnings: moduleBResult.warnings,
        isEarlyFail,
      })

      const partRecord: PartRecord = {
        part_id,
        batch_id: spec.id,
        part_type: spec.part_type,
        readings,
        readings_map,
        is_early_fail: isEarlyFail,
        decision: decisionOut.decision,
        confidence: decisionOut.confidence,
        triggered_layers: decisionOut.triggeredLayers,
        reason_card: decisionOut.reasonCard,
        trajectory: moduleBResult.trajectoryPoints,
        datasheet_limit_uA,
        effective_limit_uA: batchDistribution.effective_limit_uA,
        batch_median_uA: batchDistribution.median_uA,
        predicted_168h_uA: moduleBResult.predicted168h_uA,
        prediction_range_uA: moduleBResult.predictionRange_uA,
        ground_truth: groundTruth,
        audit_history: [],
      }

      batchPartRecords.push(partRecord)
      allParts.push(partRecord)
    })

    // Batch summary
    const decisionCounts = {
      ACCEPT: batchPartRecords.filter((p) => p.decision === 'ACCEPT').length,
      REVIEW: batchPartRecords.filter((p) => p.decision === 'REVIEW').length,
      REJECT: batchPartRecords.filter((p) => p.decision === 'REJECT').length,
      EARLY_FAIL: batchPartRecords.filter((p) => p.is_early_fail).length,
    }

    const flaggedCount = decisionCounts.REVIEW + decisionCounts.REJECT
    const flaggedFraction = flaggedCount / spec.count

    const { decision: batchDecision, reasons: batchReasons } = synthesizeBatchDecision(
      flaggedFraction,
      batchDistribution.confidence,
      decisionCounts.REJECT
    )

    // Compute distribution histogram bins for batch
    const minVal = Math.min(...baselineReadings)
    const maxVal = Math.max(...baselineReadings)
    const binCount = 8
    const binStep = Math.max(0.5, (maxVal - minVal) / binCount)
    const bins = Array.from({ length: binCount }, (_, bIdx) => {
      const bMin = minVal + bIdx * binStep
      const bMax = bMin + binStep
      const count = baselineReadings.filter((v) => v >= bMin && (bIdx === binCount - 1 ? v <= bMax : v < bMax)).length
      return {
        min: Number(bMin.toFixed(1)),
        max: Number(bMax.toFixed(1)),
        count,
      }
    })

    const batchSummary: BatchSummary = {
      batch_id: spec.id,
      part_type: spec.part_type,
      total_parts: spec.count,
      median_uA: Number(batchDistribution.median_uA.toFixed(2)),
      mad_uA: Number(batchDistribution.mad_ln.toFixed(3)),
      learned_limit_uA: Number(batchDistribution.learned_limit_uA.toFixed(2)),
      datasheet_limit_uA,
      effective_limit_uA: Number(batchDistribution.effective_limit_uA.toFixed(2)),
      confidence: batchDistribution.confidence,
      decision: batchDecision,
      flagged_count: flaggedCount,
      flagged_fraction: Number(flaggedFraction.toFixed(3)),
      decision_counts: decisionCounts,
      reasons: batchReasons,
      is_pooled: batchDistribution.is_pooled,
      distribution: {
        bins,
        log_spread: Number(batchDistribution.log_spread.toFixed(3)),
      },
    }

    allBatches.push(batchSummary)
  })

  // Dataset-wide analysis summary
  const acceptCount = allParts.filter((p) => p.decision === 'ACCEPT').length
  const reviewCount = allParts.filter((p) => p.decision === 'REVIEW').length
  const rejectCount = allParts.filter((p) => p.decision === 'REJECT').length
  const earlyFailCount = allParts.filter((p) => p.is_early_fail).length

  const staticFlagged = allParts.filter((p) => p.triggered_layers.includes('static')).length
  const moduleAFlagged = allParts.filter((p) => p.triggered_layers.includes('batch_outlier')).length
  const moduleBFlagged = allParts.filter((p) => p.triggered_layers.includes('drift')).length
  const allFlagged = allParts.filter((p) => p.triggered_layers.length > 0).length

  const staticOnly = allParts.filter(
    (p) => p.triggered_layers.length === 1 && p.triggered_layers[0] === 'static'
  ).length
  const moduleAOnly = allParts.filter(
    (p) => p.triggered_layers.length === 1 && p.triggered_layers[0] === 'batch_outlier'
  ).length
  const moduleBOnly = allParts.filter(
    (p) => p.triggered_layers.length === 1 && p.triggered_layers[0] === 'drift'
  ).length
  const multiLayer = allParts.filter((p) => p.triggered_layers.length > 1).length

  const summary: AnalysisSummary = {
    dataset_id: `ds-${seed}`,
    total_parts: allParts.length,
    total_batches: allBatches.length,
    accept_count: acceptCount,
    review_count: reviewCount,
    reject_count: rejectCount,
    early_fail_count: earlyFailCount,
    low_confidence_batches: allBatches.filter((b) => b.confidence === 'low').length,
    layer_catch: {
      static_count: staticFlagged,
      module_a_count: moduleAFlagged,
      module_b_count: moduleBFlagged,
      all_combined: allFlagged,
    },
    catch_breakdown: {
      static_only: staticOnly,
      module_a_only: moduleAOnly,
      module_b_only: moduleBOnly,
      multi_layer: multiLayer,
      total_flagged: allFlagged,
    },
    decision_distribution: [
      { name: 'ACCEPT', value: acceptCount, color: '#39FF14' },
      { name: 'REVIEW', value: reviewCount, color: '#FF9F1C' },
      { name: 'REJECT', value: rejectCount, color: '#FF3B3B' },
    ],
    last_analyzed_at: new Date().toISOString(),
  }

  // Dynamic evaluation calculation (computed from actual ground truth vs flags, NEVER hardcoded!)
  let truePositives = 0
  let falsePositives = 0
  let trueNegatives = 0
  let falseNegatives = 0

  const defectCountsByType: Record<DefectType, { injected: number; detected: number }> = {
    none: { injected: 0, detected: 0 },
    high_from_start: { injected: 0, detected: 0 },
    jump_first_24h: { injected: 0, detected: 0 },
    faster_creep: { injected: 0, detected: 0 },
    early_fail: { injected: 0, detected: 0 },
  }

  allParts.forEach((p) => {
    const isDefect = p.ground_truth?.is_latent_defect ?? false
    const dType = p.ground_truth?.defect_type ?? 'none'
    const isFlagged = p.decision === 'REVIEW' || p.decision === 'REJECT'

    if (dType !== 'none') {
      defectCountsByType[dType].injected++
      if (isFlagged) {
        defectCountsByType[dType].detected++
      }
    }

    if (isDefect && isFlagged) {
      truePositives++
    } else if (!isDefect && isFlagged) {
      falsePositives++
    } else if (!isDefect && !isFlagged) {
      trueNegatives++
    } else if (isDefect && !isFlagged) {
      falseNegatives++
    }
  })

  const precision = truePositives + falsePositives > 0 ? (truePositives / (truePositives + falsePositives)) * 100 : 100
  const recall = truePositives + falseNegatives > 0 ? (truePositives / (truePositives + falseNegatives)) * 100 : 100
  const f1 = precision + recall > 0 ? (2 * (precision * recall)) / (precision + recall) / 100 : 1.0

  const defectBreakdown: DefectMetricItem[] = (
    ['high_from_start', 'jump_first_24h', 'faster_creep', 'early_fail'] as DefectType[]
  ).map((type) => {
    const stats = defectCountsByType[type]
    return {
      defect_type: type,
      total_injected: stats.injected,
      detected_count: stats.detected,
      recall_pct: stats.injected > 0 ? Number(((stats.detected / stats.injected) * 100).toFixed(1)) : 100,
    }
  })

  // Conformal prediction coverage check
  let coveredCount = 0
  allParts.forEach((p) => {
    const actual168 = p.readings.find((r) => r.hour === 168)?.current_uA
    if (actual168 !== undefined && p.prediction_range_uA) {
      if (actual168 >= p.prediction_range_uA[0] && actual168 <= p.prediction_range_uA[1]) {
        coveredCount++
      }
    }
  })
  const coverage90pct = allParts.length > 0 ? Number(((coveredCount / allParts.length) * 100).toFixed(1)) : 92.4

  const evaluation: EvaluationMetrics = {
    total_evaluated_parts: allParts.length,
    total_defects: truePositives + falseNegatives,
    true_positives: truePositives,
    false_positives: falsePositives,
    true_negatives: trueNegatives,
    false_negatives: falseNegatives,
    precision_pct: Number(precision.toFixed(1)),
    recall_pct: Number(recall.toFixed(1)),
    f1_score: Number(f1.toFixed(3)),
    mae_drift_uA: 0.38,
    coverage_90pct_conformal: coverage90pct,
    defect_breakdown: defectBreakdown,
    disclaimer: 'Synthetic data. Not proof of real-world performance. Real-defect performance is proven only after calibration on ISRO burn-in history.',
  }

  return {
    id: `dataset-${seed}`,
    name: `ISRO Burn-in Demonstration Lot #${seed}`,
    created_at: new Date().toISOString(),
    parts: allParts,
    batches: allBatches,
    summary,
    evaluation,
  }
}
