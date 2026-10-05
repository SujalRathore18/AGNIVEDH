import { BatchSummary, PartRecord, ReasonCardData } from '../types'
import { formatMicroAmps, formatPercent } from '../utils'
import { getMockState } from './state'

export interface AssistantResponse {
  query: string
  intent: 'part_query' | 'batch_risk' | 'safety_question' | 'drift_query' | 'confidence_explanation' | 'general' | 'not_found'
  answer: string
  partDetails?: PartRecord
  batchDetails?: BatchSummary
  reasonCard?: ReasonCardData
  actionLink?: {
    href: string
    label: string
  }
}

export function answerAgnivedhQuery(query: string): AssistantResponse {
  const trimmed = query.trim()
  const lower = trimmed.toLowerCase()
  const state = getMockState()
  const currentDataset = state.currentDataset
  const parts = currentDataset.parts
  const batches = currentDataset.batches

  // 1. Part ID intent (e.g., "P-0007", "why was part P-0007 flagged?", "tell me about P-0001")
  const partMatch = trimmed.match(/P-\d{4}/i) || trimmed.match(/part\s+([A-Za-z0-9_-]+)/i)
  if (partMatch) {
    const rawId = (partMatch[0].startsWith('part') ? partMatch[1] : partMatch[0]).toUpperCase()
    const foundPart = parts.find((p) => p.part_id.toUpperCase() === rawId)

    if (foundPart) {
      const { part_id, batch_id, decision, reason_card, readings, effective_limit_uA, datasheet_limit_uA } = foundPart
      const r0 = readings[0]?.current_uA
      const r168 = readings[readings.length - 1]?.current_uA
      const r168Forecast = foundPart.predicted_168h_uA

      let answer = ''
      if (decision === 'ACCEPT') {
        answer = `Part ${part_id} (Batch ${batch_id}) is ACCEPTED. Baseline leakage is ${formatMicroAmps(r0)}, remaining well below the batch effective limit (${formatMicroAmps(effective_limit_uA)}) and 50 µA datasheet limit. Drift forecast to 168h is ${formatMicroAmps(r168Forecast)}, demonstrating stable burn-in behavior.`
      } else if (decision === 'REVIEW') {
        answer = `Part ${part_id} (Batch ${batch_id}) has been placed in REVIEW. ${reason_card.summary} Baseline reading is ${formatMicroAmps(r0)} vs batch learned limit of ${formatMicroAmps(effective_limit_uA)}. Layer 2 (Module A) flagged this part as a statistical outlier even though it remains under the ${formatMicroAmps(datasheet_limit_uA)} datasheet limit.`
      } else {
        answer = `Part ${part_id} (Batch ${batch_id}) has been REJECTED. ${reason_card.summary} 168h projected leakage reaches ${formatMicroAmps(r168Forecast)} (upper bound: ${formatMicroAmps(foundPart.prediction_range_uA?.[1])}), which breaches reliability guidelines.`
      }

      return {
        query: trimmed,
        intent: 'part_query',
        answer,
        partDetails: foundPart,
        reasonCard: reason_card,
        actionLink: {
          href: `/dashboard/parts/${foundPart.part_id}`,
          label: `Open full details for ${foundPart.part_id} →`,
        },
      }
    } else {
      return {
        query: trimmed,
        intent: 'not_found',
        answer: `Part ID "${rawId}" was not found in the current loaded dataset (${currentDataset.name}). Loaded parts range from ${parts[0]?.part_id} to ${parts[parts.length - 1]?.part_id}.`,
      }
    }
  }

  // 2. "Is 45 µA safe in a 10 µA batch?" or general safety limit question
  if (lower.includes('45') && (lower.includes('10') || lower.includes('safe'))) {
    const p0007 = parts.find((p) => p.part_id === 'P-0007')
    return {
      query: trimmed,
      intent: 'safety_question',
      answer: `No. In a batch with a median of 10.0 µA and a log-spread of 0.18, Module A computes a learned limit of 22.5 µA (using threshold 4.5 × MAD). A 45.0 µA reading produces an outlier score of 8.4, which is 4.5× the batch median. Even though 45.0 µA is beneath the 50.0 µA datasheet limit, this part represents a latent defect and is flagged for quarantine.`,
      partDetails: p0007,
      reasonCard: p0007?.reason_card,
      actionLink: p0007 ? {
        href: `/dashboard/parts/${p0007.part_id}`,
        label: `Inspect Part ${p0007.part_id} (45 µA in 10 µA batch) →`,
      } : undefined,
    }
  }

  // 3. Risky batches intent ("which batches are risky?", "risky", "batch risk")
  if (lower.includes('risky') || lower.includes('worst batch') || lower.includes('problem batch') || (lower.includes('batch') && lower.includes('risk'))) {
    const riskyBatches = batches.filter((b) => b.decision === 'REJECT' || b.decision === 'REVIEW')
    const rejectBatches = batches.filter((b) => b.decision === 'REJECT')
    const reviewBatches = batches.filter((b) => b.decision === 'REVIEW')

    let answer = `Analysis identifies ${riskyBatches.length} batch(es) requiring attention out of ${batches.length} total batches: `
    if (rejectBatches.length > 0) {
      answer += `REJECT: ${rejectBatches.map((b) => `${b.batch_id} (${(b.flagged_fraction * 100).toFixed(1)}% flagged)`).join(', ')}. `
    }
    if (reviewBatches.length > 0) {
      answer += `REVIEW: ${reviewBatches.map((b) => `${b.batch_id} (${b.confidence === 'low' ? 'sample < 30' : `${(b.flagged_fraction * 100).toFixed(1)}% flagged`})`).join(', ')}. `
    }
    answer += `High flagged fractions indicate systemic wafer processing or package stress anomalies.`

    return {
      query: trimmed,
      intent: 'batch_risk',
      answer,
      actionLink: {
        href: '/dashboard',
        label: 'View Batch Decision Grid in Console →',
      },
    }
  }

  // 4. Drift queries ("Show parts that drift faster than their batch", "drift", "faster")
  if (lower.includes('drift') || lower.includes('faster') || lower.includes('creep')) {
    const driftFlaggedParts = parts.filter((p) => p.triggered_layers.includes('drift'))
    const count = driftFlaggedParts.length
    const samplePart = driftFlaggedParts[0]

    let answer = `Module B identified ${count} part(s) exhibiting accelerated or non-linear drift exceeding their batch's median 0-24h trajectory. `
    if (samplePart) {
      const r0 = samplePart.readings[0]?.current_uA
      const r24 = samplePart.readings[1]?.current_uA
      answer += `For example, part ${samplePart.part_id} jumped from ${formatMicroAmps(r0)} to ${formatMicroAmps(r24)} at 24h, projecting a 168h leakage of ${formatMicroAmps(samplePart.predicted_168h_uA)} (upper bound ${formatMicroAmps(samplePart.prediction_range_uA?.[1])}).`
    }

    return {
      query: trimmed,
      intent: 'drift_query',
      answer,
      partDetails: samplePart,
      reasonCard: samplePart?.reason_card,
      actionLink: {
        href: '/dashboard/parts?layer=drift',
        label: `View all ${count} drift-flagged parts →`,
      },
    }
  }

  // 5. Low confidence intent ("What does low confidence mean?", "low confidence", "sample size")
  if (lower.includes('low confidence') || lower.includes('confidence') || lower.includes('sample')) {
    const smallBatches = batches.filter((b) => b.confidence === 'low')
    const batchNames = smallBatches.map((b) => `${b.batch_id} (n=${b.total_parts})`).join(', ')

    const answer = `When a batch contains fewer than 30 components (such as ${batchNames || 'batches with n<30'}), individual Median Absolute Deviation (MAD) is statistically vulnerable to small-sample bias. AGNIVEDH automatically switches to cross-batch pooling to compute reference bounds and marks the batch confidence as "LOW". Any outlier in these batches is routed to the human QA inspector Review lane rather than auto-rejected.`

    return {
      query: trimmed,
      intent: 'confidence_explanation',
      answer,
      actionLink: smallBatches[0] ? {
        href: `/dashboard/batches/${smallBatches[0].batch_id}`,
        label: `Inspect low-confidence batch ${smallBatches[0].batch_id} →`,
      } : undefined,
    }
  }

  // 6. Generic or fallback query matching
  return {
    query: trimmed,
    intent: 'general',
    answer: `AGNIVEDH inspected the active dataset "${currentDataset.name}" (${parts.length} parts across ${batches.length} batches). Currently, ${currentDataset.summary.accept_count} parts are ACCEPTED, ${currentDataset.summary.review_count} are in REVIEW, and ${currentDataset.summary.reject_count} are REJECTED. Layer 2 (Module A) caught ${currentDataset.summary.layer_catch.module_a_count} statistical batch outliers, and Layer 3 (Module B) caught ${currentDataset.summary.layer_catch.module_b_count} drift anomalies.`,
    actionLink: {
      href: '/dashboard',
      label: 'Open Inspector Console →',
    },
  }
}
