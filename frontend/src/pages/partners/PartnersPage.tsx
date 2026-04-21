import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { partnersApi } from '../../api/partners'
import { Table, Pagination } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export const PartnersPage: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['partners', { search, page }],
    queryFn: () => partnersApi.list({ search: search || undefined, page, limit: 20 }),
  })

  const columns = [
    { key: 'name', header: 'Nome', render: (r: any) => <span className="font-semibold">{r.name}</span> },
    { key: 'type', header: 'Tipo', render: (r: any) => r.type || '—' },
    { key: 'phone', header: 'Telefono', render: (r: any) => r.phone || '—' },
    { key: 'email', header: 'Email', render: (r: any) => r.email || '—' },
    { key: '_count', header: 'Pratiche', render: (r: any) => <span className="text-blue-600 font-medium">{r._count?.cases || 0}</span> },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Partner</h1>
        <Button icon={<Plus size={16} />} onClick={() => navigate('/partners/new')}>Nuovo partner</Button>
      </div>
      <Card padding="none">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Cerca partner..." className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        <Table columns={columns} data={data?.items || []} isLoading={isLoading}
          onRowClick={(r: any) => navigate(`/partners/${r.id}`)} emptyMessage="Nessun partner" />
        {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} limit={data.meta.limit} onPageChange={setPage} />}
      </Card>
    </div>
  )
}
