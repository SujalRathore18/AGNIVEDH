'use client'

import React from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (key: string) => void
  page?: number
  pageSize?: number
  totalItems?: number
  onPageChange?: (newPage: number) => void
  isLoading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
  className?: string
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  sortBy,
  sortOrder,
  onSort,
  page = 1,
  pageSize = 15,
  totalItems,
  onPageChange,
  isLoading = false,
  emptyMessage = 'No matching records in dataset.',
  onRowClick,
  className,
}: DataTableProps<T>) {
  const total = totalItems !== undefined ? totalItems : data.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className={cn('w-full flex flex-col space-y-3', className)}>
      <div className="overflow-x-auto border border-surface-border bg-[#070D0A]/90 chamfer-md">
        <table className="w-full text-left border-collapse text-xs font-space">
          <thead>
            <tr className="border-b border-surface-border bg-black/40 text-muted uppercase font-mono tracking-wider">
              {columns.map((col) => {
                const isCurrentSort = sortBy === col.key
                return (
                  <th
                    key={col.key}
                    scope="col"
                    onClick={() => col.sortable && onSort && onSort(col.key)}
                    className={cn(
                      'px-4 py-3.5 select-none font-medium',
                      col.sortable ? 'cursor-pointer hover:text-slate-100 transition-colors' : '',
                      col.className
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-muted/60">
                          {isCurrentSort ? (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#39FF14]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#39FF14]" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3 h-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`}>
                  {columns.map((col, cIdx) => (
                    <td key={`sc-${cIdx}`} className="px-4 py-3.5">
                      <div className="h-4 bg-[#122018]/50 animate-pulse rounded chamfer-sm" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const rowKey = keyExtractor(item)
                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={cn(
                      'hover:bg-[#122219]/40 transition-colors',
                      onRowClick ? 'cursor-pointer' : ''
                    )}
                  >
                    {columns.map((col) => (
                      <td key={`${rowKey}-${col.key}`} className={cn('px-4 py-3 text-slate-200', col.className)}>
                        {col.render ? col.render(item) : (item as any)[col.key]}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-2 text-xs font-mono text-muted">
          <div>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} parts
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 bg-[#08100C] border border-surface-border chamfer-sm hover:border-[#39FF14]/50 disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-[#0E1C15] border border-surface-border chamfer-sm text-slate-200">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 bg-[#08100C] border border-surface-border chamfer-sm hover:border-[#39FF14]/50 disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
