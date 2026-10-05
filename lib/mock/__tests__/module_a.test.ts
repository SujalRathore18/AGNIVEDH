import { describe, it, expect } from 'vitest'
import { calculateOutlierScore, evaluateModuleA, BatchDistributionMetrics } from '../module_a'

describe('Module A: Robust Batch Outlier Detection', () => {
  it('correctly calculates learned limit and flags a 45 uA part in a 10 uA batch', () => {
    // Specific values from specification:
    // median = 10 uA -> ln(10) ≈ 2.302585
    // log-spread (1.4826 * MAD) = 0.18
    // threshold = 4.5
    // datasheet limit = 50 uA
    const median_uA = 10.0
    const median_ln = Math.log(median_uA)
    const log_spread = 0.18
    const threshold = 4.5
    const datasheet_limit_uA = 50.0

    // learned limit = exp(median_ln + 4.5 * 0.18)
    const learned_limit_uA = Math.exp(median_ln + threshold * log_spread)
    const effective_limit_uA = Math.min(learned_limit_uA, datasheet_limit_uA)

    // Verify limit is about 22.5 uA (~22.48 uA)
    expect(learned_limit_uA).toBeCloseTo(22.48, 1)
    expect(Number(learned_limit_uA.toFixed(1))).toBe(22.5)

    // Calculate score for 45 uA part
    const x_uA = 45.0
    const score = calculateOutlierScore(x_uA, median_ln, log_spread)

    // Verify score is about 8.4 (~8.36)
    expect(score).toBeCloseTo(8.36, 1)
    expect(Number(score.toFixed(1))).toBe(8.4)

    // Verify evaluation flags the part
    const mockBatchMetrics: BatchDistributionMetrics = {
      median_uA,
      median_ln,
      mad_ln: log_spread / 1.4826,
      log_spread,
      learned_limit_uA,
      datasheet_limit_uA,
      effective_limit_uA,
      sample_size: 50,
      confidence: 'normal',
      is_pooled: false,
    }

    const result = evaluateModuleA(x_uA, mockBatchMetrics, threshold)

    // 45 uA is under 50 uA datasheet limit, but must be FLAGGED by Module A!
    expect(x_uA).toBeLessThan(datasheet_limit_uA)
    expect(result.triggered).toBe(true)
    expect(result.score).toBeCloseTo(8.36, 1)
    expect(result.effective_limit_uA).toBeCloseTo(22.48, 1)
    expect(result.batch_median_uA).toBe(10.0)
    expect(result.detail).toContain('MAD score 8.4')
  })

  it('marks low confidence when sample size is under 30', () => {
    const mockSmallBatch: BatchDistributionMetrics = {
      median_uA: 10.0,
      median_ln: Math.log(10.0),
      mad_ln: 0.12,
      log_spread: 0.18,
      learned_limit_uA: 22.5,
      datasheet_limit_uA: 50.0,
      effective_limit_uA: 22.5,
      sample_size: 18,
      confidence: 'low',
      is_pooled: true,
    }

    const result = evaluateModuleA(11.0, mockSmallBatch, 4.5)
    expect(result.detail).toContain('low confidence')
  })
})
