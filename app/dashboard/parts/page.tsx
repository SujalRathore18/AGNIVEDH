'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Cpu, Search, Filter, ArrowUpDown, ExternalLink } from 'lucide-react'
import { useDashboard } from '@/components/dashboard/DashboardContext'
import { DataTable, Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Input } from '@/components/ui/Input'
import { Decision, LayerName, PartRecord } from '@/lib/types'
import { formatMicroAmps } from '@/lib/utils'

export default function PartsPage() {
  const router = useRouter()
  const { parts, batches, isLoading } = useDashboard()

  // Filter and search state
  const [search, setSearch] = useState('')
  const [filterDecision, setFilterDecision] = useState<Decision | 'ALL'>('ALL')
  const [filterBatch, setFilterBatch] = useState<string>('ALL')
  const [filterLayer, setFilterLayer] = useState<LayerName | 'ALL'>('ALL')

  // Sorting and pagination
  const [page, setPage] = useState(1)
  const pageSize = 15
  const [sortBy, setSortBy] = useState<string>('part_id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Filtered and sorted data
  const filteredParts = useMemo(() => {
    let result = [...parts]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.part_id.toLowerCase().includes(q) ||
          p.batch_id.toLowerCase().includes(q) ||
          p.part_type.toLowerCase().includes(q)
      )
    }

    if (filterDecision !== 'ALL') {
      result = result.filter((p) => p.decision === filterDecision)
    }

    if (filterBatch !== 'ALL') {
      result = result.filter((p) => p.batch_id === filterBatch)
    }

    if (filterLayer !== 'ALL') {
      result = result.filter((p) => p.triggered_layers.includes(filterLayer))
    }

    // Sort
    result.sort((a, b) => {
      let valA: any = a[sortBy as keyof PartRecord]
      let valB: any = b[sortBy as keyof PartRecord]

      if (sortBy === 'baseline') {
        valA = a.readings[0]?.current_uA ?? 0
        valB = b.readings[0]?.current_uA ?? 0
      } else if (sortBy === 'forecast') {
        valA = a.predicted_168h_uA ?? 0
        valB = b.predicted_168h_uA ?? 0
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA
      }
      return sortOrder === 'asc'
        ? String(valA || '').localeCompare(String(valB || ''))
        : String(valB || '').localeCompare(String(valA || ''))
    })

    return result
  }, [parts, search, filterDecision, filterBatch, filterLayer, sortBy, sortOrder])

  const paginatedParts = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredParts.slice(start, start + pageSize)
  }, [filteredParts, page, pageSize])

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortOrder('asc')
    }
  }

  // Table columns definition
  const columns: Column<PartRecord>[] = [
    {
      key: 'part_id',
      header: 'Part ID',
      sortable: true,
      render: (p) => (
        <span className="font-heading font-bold text-white group-hover:text-[#39FF14]">
          {p.part_id}
        </span>
      ),
    },
    {
      key: 'batch_id',
      header: 'Batch Lot',
      sortable: true,
      render: (p) => (
        <span className="font-mono text-xs px-2 py-0.5 bg-black/50 border border-surface-border chamfer-sm">
          {p.batch_id}
        </span>
      ),
    },
    {
      key: 'part_type',
      header: 'Device Type',
      sortable: true,
      className: 'hidden md:table-cell',
      render: (p) => <span className="text-muted text-xs truncate">{p.part_type}</span>,
    },
    {
      key: 'decision',
      header: 'Decision',
      sortable: true,
      render: (p) => <StatusBadge status={p.decision} size="sm" />,
    },
    {
      key: 'baseline',
      header: '0h Baseline',
      sortable: true,
      render: (p) => {
        const r0 = p.readings[0]?.current_uA
        const isHigh = r0 && r0 > 22.5
        return (
          <span className={isHigh ? 'text-[#FF9F1C] font-bold' : 'text-slate-200'}>
            {formatMicroAmps(r0)}
          </span>
        )
      },
    },
    {
      key: 'forecast',
      header: '168h Forecast',
      sortable: true,
      render: (p) => (
        <div className="font-mono">
          <span className="text-[#39FF14] font-bold">
            {formatMicroAmps(p.predicted_168h_uA)}
          </span>
          {p.prediction_range_uA && (
            <span className="text-[10px] text-muted-dark block">
              [{formatMicroAmps(p.prediction_range_uA[0], 0)}–{formatMicroAmps(p.prediction_range_uA[1], 0)}]
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'triggered_layers',
      header: 'Triggered Flags',
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.triggered_layers.length === 0 ? (
            <span className="text-[11px] text-[#39FF14] font-mono">NOMINAL</span>
          ) : (
            p.triggered_layers.map((l) => (
              <span
                key={l}
                className={`text-[9px] font-mono uppercase px-1.5 py-0.2 chamfer-sm ${
                  l === 'static'
                    ? 'bg-reject/20 text-[#FF3B3B] border border-reject/40'
                    : l === 'batch_outlier'
                    ? 'bg-amber/20 text-[#FF9F1C] border border-amber/40'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}
              >
                {l === 'static' ? 'L1:STATIC' : l === 'batch_outlier' ? 'L2:MOD_A' : 'L3:MOD_B'}
              </span>
            ))
          )}
        </div>
      ),
    },
    {
      key: 'action',
      header: '',
      render: (p) => (
        <Link
          href={`/dashboard/parts/${p.part_id}`}
          onClick={(e) => e.stopPropagation()}
          className="p-1 text-muted hover:text-[#39FF14] transition-colors inline-flex items-center"
          title={`View full details for ${p.part_id}`}
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-white flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-[#39FF14]" />
            Component Telemetry &amp; Decision Roster
          </h2>
          <p className="text-xs text-muted font-space">
            Multi-layer screening flags, baseline leakage, and 168h trajectory forecasts.
          </p>
        </div>
        <div className="text-xs font-mono text-muted">
          Showing {filteredParts.length} of {parts.length} components
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#080E0B] border border-surface-border chamfer-md p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search by Part ID */}
          <Input
            placeholder="Search part ID or batch…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            leftIcon={<Search className="w-4 h-4 text-muted" />}
          />

          {/* Decision filter */}
          <div>
            <select
              value={filterDecision}
              onChange={(e) => {
                setFilterDecision(e.target.value as any)
                setPage(1)
              }}
              className="w-full bg-[#080E0B] text-slate-100 border border-surface-border text-sm px-3 py-2.5 chamfer-sm focus:border-[#39FF14] focus:outline-none"
            >
              <option value="ALL">All Decisions</option>
              <option value="ACCEPT">ACCEPT Only</option>
              <option value="REVIEW">REVIEW (Quarantine)</option>
              <option value="REJECT">REJECT</option>
            </select>
          </div>

          {/* Batch filter */}
          <div>
            <select
              value={filterBatch}
              onChange={(e) => {
                setFilterBatch(e.target.value)
                setPage(1)
              }}
              className="w-full bg-[#080E0B] text-slate-100 border border-surface-border text-sm px-3 py-2.5 chamfer-sm focus:border-[#39FF14] focus:outline-none"
            >
              <option value="ALL">All Batches</option>
              {batches.map((b) => (
                <option key={b.batch_id} value={b.batch_id}>
                  {b.batch_id} ({b.part_type})
                </option>
              ))}
            </select>
          </div>

          {/* Layer filter */}
          <div>
            <select
              value={filterLayer}
              onChange={(e) => {
                setFilterLayer(e.target.value as any)
                setPage(1)
              }}
              className="w-full bg-[#080E0B] text-slate-100 border border-surface-border text-sm px-3 py-2.5 chamfer-sm focus:border-[#39FF14] focus:outline-none"
            >
              <option value="ALL">All Layers</option>
              <option value="static">Layer 1: Static Breaches</option>
              <option value="batch_outlier">Layer 2: Module A Outliers</option>
              <option value="drift">Layer 3: Module B Drift Flags</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parts Table */}
      <DataTable
        data={paginatedParts}
        columns={columns}
        keyExtractor={(p) => p.part_id}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        page={page}
        pageSize={pageSize}
        totalItems={filteredParts.length}
        onPageChange={(newPage) => setPage(newPage)}
        isLoading={isLoading}
        onRowClick={(p) => router.push(`/dashboard/parts/${p.part_id}`)}
      />
    </div>
  )
}
