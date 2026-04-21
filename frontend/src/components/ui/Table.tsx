import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  width?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  isLoading?: boolean
  emptyMessage?: string
}

export function Table<T extends { id?: string }>({
  columns,
  data,
  onRowClick,
  isLoading,
  emptyMessage = 'Nessun dato disponibile',
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                style={col.width ? { width: col.width } : {}}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400 text-sm">
                <div className="flex justify-center">
                  <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={(row as any).id || i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-slate-100 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-blue-50/50' : 'hover:bg-slate-50/50'}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-slate-700">
                    {col.render ? col.render(row) : (row as any)[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, total, limit, onPageChange }) => {
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
      <span className="text-xs text-slate-500">
        {from}–{to} di {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-40 text-slate-600 cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs font-medium text-slate-600 px-2">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-40 text-slate-600 cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
