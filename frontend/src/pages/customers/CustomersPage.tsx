import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { customersApi } from '../../api/customers'
import { Table, Pagination } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { ConfirmModal } from '../../components/ui/Modal'
import { Card } from '../../components/ui/Card'

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['customers', { search, page }],
    queryFn: () => customersApi.list({ search: search || undefined, page, limit: 20 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      setDeleteId(null)
      setDeleteError(null)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || 'Errore durante l\'eliminazione'
      setDeleteError(msg)
    },
  })

  const columns = [
    {
      key: 'name',
      header: 'Cliente',
      render: (r: any) => (
        <div>
          <div className="font-medium text-slate-900">
            {r.companyName || `${r.lastName || ''} ${r.firstName || ''}`.trim() || '—'}
          </div>
          {r.fiscalCode && <div className="text-xs text-slate-500">{r.fiscalCode}</div>}
        </div>
      ),
    },
    { key: 'phone', header: 'Telefono', render: (r: any) => r.phone || '—' },
    { key: 'email', header: 'Email', render: (r: any) => r.email || '—' },
    { key: 'city', header: 'Città', render: (r: any) => r.city || '—' },
    {
      key: '_count',
      header: 'Pratiche',
      render: (r: any) => <span className="text-blue-600 font-medium">{r._count?.cases || 0}</span>,
    },
    {
      key: 'actions',
      header: '',
      width: '80px',
      render: (r: any) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/customers/${r.id}/edit`)}
            className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setDeleteId(r.id)}
            className="p-1 hover:bg-red-50 rounded text-red-400 cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Clienti</h1>
        <Button icon={<Plus size={16} />} onClick={() => navigate('/customers/new')}>
          Nuovo cliente
        </Button>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Cerca per nome, CF, telefono..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <Table
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
          onRowClick={(r: any) => navigate(`/customers/${r.id}`)}
          emptyMessage="Nessun cliente trovato"
        />
        {data?.meta && (
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            total={data.meta.total}
            limit={data.meta.limit}
            onPageChange={setPage}
          />
        )}
      </Card>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => { setDeleteId(null); setDeleteError(null) }}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Elimina cliente"
        message="Sei sicuro di voler eliminare definitivamente questo cliente?"
        confirmLabel="Elimina"
        loading={deleteMutation.isPending}
        error={deleteError ?? undefined}
      />
    </div>
  )
}
