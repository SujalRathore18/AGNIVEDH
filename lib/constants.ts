import { AppBranding } from './types'

export const BRANDING: AppBranding = {
  name: 'AGNIVEDH',
  full_title: 'Explainable AI for Latent Defect Detection in Component Burn-In',
  tagline: 'Probe Deep. Detect Early. Ensure Reliability.',
  footer_credit: 'ISRO | Smart India Hackathon 2026 | PS 26170 | Team GSR NEXUS',
}

export const CONTEXT_META = {
  hackathon: 'Smart India Hackathon 2026',
  problem_statement: 'PS 26170',
  organization: 'ISRO',
  team: 'Team GSR NEXUS',
}

export const DEFAULT_DATASHEET_LIMIT_UA = 50.0 // 50 uA standard max leakage
export const DEFAULT_OUTLIER_THRESHOLD = 4.5 // Standard 4.5 MAD threshold
export const MIN_BATCH_SAMPLE_SIZE = 30 // Batches below 30 trigger low-confidence pooling
export const MAD_FLOOR = 0.05 // Minimum log-scale MAD to avoid division-by-zero on ultra-uniform data
