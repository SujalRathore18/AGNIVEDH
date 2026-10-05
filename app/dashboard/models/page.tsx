'use client'

import React, { useState } from 'react'
import { Sliders, RefreshCw, Cpu, CheckCircle2, GitBranch, ShieldCheck } from 'lucide-react'
import { useDashboard } from '@/components/dashboard/DashboardContext'
import { getApiClient } from '@/lib/api'
import { ClippedPanel } from '@/components/ui/ClippedPanel'
import { Button } from '@/components/ui/Button'
import { StatTile } from '@/components/ui/StatTile'
import { Skeleton } from '@/components/ui/FeedbackStates'
import { useToast } from '@/components/ui/Toast'
import { formatMicroAmps } from '@/lib/utils'

export default function ModelsPage() {
  const { models, refreshData, isLoading } = useDashboard()
  const { addToast } = useToast()
  const [selectedType, setSelectedType] = useState<'RIDGE' | 'LIGHTGBM'>('RIDGE')
  const [isRetraining, setIsRetraining] = useState(false)

  const activeModel = models[0]

  const handleRetrain = async () => {
    try {
      setIsRetraining(true)
      const client = getApiClient()
      await client.retrainModel(selectedType)
      await refreshData()
      addToast(
        `Retrained ${selectedType} burn-in forecaster model on batch-grouped CV.`,
        'success',
        'Model Calibrated'
      )
    } catch (err: any) {
      addToast(err.message || 'Retraining failed', 'error')
    } finally {
      setIsRetraining(false)
    }
  }

  if (isLoading || !activeModel) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-white flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-[#39FF14]" />
            Trajectory Model Architecture &amp; Cross-Validation
          </h2>
          <p className="text-xs text-muted font-space">
            Batch-grouped cross-validation preventing data leakage between silicon fabrication runs.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          glow
          onClick={handleRetrain}
          loading={isRetraining}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Retrain Model
        </Button>
      </div>

      {/* Model Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ridge Card */}
        <div
          onClick={() => setSelectedType('RIDGE')}
          className={`p-5 chamfer-md border cursor-pointer transition-all duration-200 ${
            selectedType === 'RIDGE'
              ? 'bg-[#122219] border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.2)]'
              : 'bg-[#080E0B] border-surface-border text-muted hover:border-surface-borderHover'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-heading font-bold text-sm text-white">L2-Ridge Burn-in Forecaster</span>
            <span className="text-[10px] font-mono text-[#39FF14] px-1.5 py-0.2 bg-black border border-[#39FF14]/30 chamfer-sm">
              DEFAULT / FLIGHT QUAL
            </span>
          </div>
          <p className="text-xs text-slate-300 font-space leading-relaxed mb-3">
            Regularized linear regression strictly bounded by physical diffusion physics. Robust against overfitting on small lots.
          </p>
          <div className="text-[11px] font-mono text-muted flex items-center justify-between">
            <span>CV MAE: 0.38 µA</span>
            <span>CV R²: 0.942</span>
          </div>
        </div>

        {/* LightGBM Card */}
        <div
          onClick={() => setSelectedType('LIGHTGBM')}
          className={`p-5 chamfer-md border cursor-pointer transition-all duration-200 ${
            selectedType === 'LIGHTGBM'
              ? 'bg-[#122219] border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.2)]'
              : 'bg-[#080E0B] border-surface-border text-muted hover:border-surface-borderHover'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-heading font-bold text-sm text-white">LightGBM Gradient Booster</span>
            <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.2 bg-black border border-cyan-500/30 chamfer-sm">
              RESEARCH / NON-LINEAR
            </span>
          </div>
          <p className="text-xs text-slate-300 font-space leading-relaxed mb-3">
            Gradient-boosted decision trees with monotonic temperature acceleration constraints. Captures subtle interaction curvature.
          </p>
          <div className="text-[11px] font-mono text-muted flex items-center justify-between">
            <span>CV MAE: 0.33 µA</span>
            <span>CV R²: 0.958</span>
          </div>
        </div>
      </div>

      {/* Model Spec & Training Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Active Model"
          value={activeModel.type}
          subtext={activeModel.version}
          icon={<Cpu className="w-5 h-5 text-[#39FF14]" />}
          variant="green"
        />

        <StatTile
          label="Grouped CV MAE"
          value={formatMicroAmps(activeModel.cv_mae_uA, 2)}
          subtext="Unseen lot prediction error"
          icon={<GitBranch className="w-5 h-5 text-cyan-400" />}
          variant="cyan"
        />

        <StatTile
          label="CV R² Score"
          value={activeModel.cv_r2.toFixed(3)}
          subtext="Variance explained"
          icon={<CheckCircle2 className="w-5 h-5 text-[#FF9F1C]" />}
          variant="amber"
        />

        <StatTile
          label="Calibration Samples"
          value={activeModel.trained_on_samples}
          subtext={`Updated: ${new Date(activeModel.last_trained).toLocaleDateString()}`}
          icon={<ShieldCheck className="w-5 h-5 text-white" />}
          variant="default"
        />
      </div>

      {/* Features Table */}
      <ClippedPanel
        headerSlot={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-200">
              Input Physics Features (0–24 Hour Burn-in Telemetry)
            </span>
            <span className="text-[11px] font-mono text-muted">
              Batch-Grouped Splitting
            </span>
          </div>
        }
      >
        <div className="space-y-3 font-mono text-xs">
          {activeModel.features.map((feat, idx) => (
            <div
              key={idx}
              className="p-3 bg-black/40 border border-surface-border chamfer-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-[#39FF14] font-bold">#{idx + 1}</span>
                <span className="text-white">{feat}</span>
              </div>
              <span className="text-[11px] text-muted">
                {idx === 0
                  ? 'Baseline leakage log transform'
                  : idx === 1
                  ? '0h to 24h differential growth'
                  : idx === 2
                  ? 'Normalized offset vs peer cohort'
                  : 'Environmental physical parameter'}
              </span>
            </div>
          ))}
        </div>
      </ClippedPanel>
    </div>
  )
}
