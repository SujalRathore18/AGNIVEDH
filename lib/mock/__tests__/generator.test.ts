import { describe, it, expect } from 'vitest'
import { generateSyntheticDataset } from '../generator'

describe('Synthetic Dataset Generator & Acceptance Checks', () => {
  const dataset = generateSyntheticDataset(42, 50.0, 5)

  it('generates the dataset with P-0007 in B-01 flagged by Module A under 50 uA datasheet limit', () => {
    const p0007 = dataset.parts.find((p) => p.part_id === 'P-0007')
    expect(p0007).toBeDefined()
    if (!p0007) return

    expect(p0007.batch_id).toBe('B-01')
    expect(p0007.readings[0].current_uA).toBe(45.0)
    expect(p0007.datasheet_limit_uA).toBe(50.0)

    // Baseline is strictly under datasheet limit
    expect(p0007.readings[0].current_uA).toBeLessThan(p0007.datasheet_limit_uA)

    // Triggered layers should include batch_outlier (Module A)
    expect(p0007.triggered_layers).toContain('batch_outlier')
    expect(p0007.reason_card.layers.find((l) => l.layer === 'batch_outlier')?.triggered).toBe(true)

    // Readable reason card summary & score
    expect(p0007.reason_card.summary).toBeTruthy()
    const moduleALayer = p0007.reason_card.layers.find((l) => l.layer === 'batch_outlier')
    expect(moduleALayer?.score).toBeGreaterThan(4.5)
  })

  it('marks batch B-04 as low confidence because sample size is under 30', () => {
    const b04 = dataset.batches.find((b) => b.batch_id === 'B-04')
    expect(b04).toBeDefined()
    if (!b04) return

    expect(b04.total_parts).toBeLessThan(30)
    expect(b04.confidence).toBe('low')
    expect(b04.is_pooled).toBe(true)

    const b04Parts = dataset.parts.filter((p) => p.batch_id === 'B-04')
    expect(b04Parts.length).toBe(b04.total_parts)
    expect(b04Parts[0].confidence).toBe('low')
  })

  it('computes evaluation metrics dynamically without hardcoded slide numbers', () => {
    expect(dataset.evaluation).toBeDefined()
    expect(dataset.evaluation.disclaimer).toContain('Synthetic data')
    expect(dataset.evaluation.recall_pct).toBeGreaterThan(0)
    expect(dataset.evaluation.defect_breakdown.length).toBe(4)
  })
})
