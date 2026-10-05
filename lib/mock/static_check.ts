import { LayerResult, PartReading } from '../types'
import { formatMicroAmps } from '../utils'

export function evaluateStaticCheck(
  readings: PartReading[],
  datasheetLimit_uA: number
): LayerResult {
  const maxReading = Math.max(...readings.map((r) => r.current_uA), 0)
  const violated = maxReading > datasheetLimit_uA
  const violatingReading = readings.find((r) => r.current_uA > datasheetLimit_uA)

  return {
    layer: 'static',
    triggered: violated,
    effective_limit_uA: datasheetLimit_uA,
    detail: violated
      ? `Leakage of ${formatMicroAmps(violatingReading?.current_uA || maxReading)} at ${violatingReading?.hour ?? 0}h exceeds datasheet specification limit of ${formatMicroAmps(datasheetLimit_uA)}.`
      : `All observed readings (max ${formatMicroAmps(maxReading)}) are within datasheet specification limit of ${formatMicroAmps(datasheetLimit_uA)}.`,
  }
}
