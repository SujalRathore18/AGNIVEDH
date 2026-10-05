import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMicroAmps(val: number | undefined | null, decimals = 1): string {
  if (val === undefined || val === null || isNaN(val)) return '—'
  return `${val.toFixed(decimals)} µA`
}

export function formatPercent(val: number | undefined | null, decimals = 1): string {
  if (val === undefined || val === null || isNaN(val)) return '—'
  return `${val.toFixed(decimals)}%`
}

export function formatNumber(val: number | undefined | null, decimals = 2): string {
  if (val === undefined || val === null || isNaN(val)) return '—'
  return val.toFixed(decimals)
}

/**
 * Robust median calculation
 */
export function calculateMedian(values: number[]): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * Median Absolute Deviation (MAD)
 */
export function calculateMAD(values: number[], medianVal?: number): number {
  if (!values.length) return 0
  const m = medianVal !== undefined ? medianVal : calculateMedian(values)
  const deviations = values.map((v) => Math.abs(v - m))
  return calculateMedian(deviations)
}

/**
 * Seeded pseudo-random number generator (Mulberry32)
 */
export function createPRNG(seed: number) {
  let s = Math.floor(seed) || 123456789
  return function () {
    let t = (s += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Box-Muller normal distribution generator
 */
export function randomNormal(prng: () => number, mean = 0, stdDev = 1): number {
  const u1 = Math.max(1e-10, prng())
  const u2 = prng()
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
  return mean + z * stdDev
}

/**
 * Lognormal random generator
 */
export function randomLogNormal(prng: () => number, logMean: number, logStdDev: number): number {
  return Math.exp(randomNormal(prng, logMean, logStdDev))
}
