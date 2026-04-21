import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { vehiclesApi } from '../../api/vehicles'
import { Table, Pagination } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export const VehiclesPage: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['vehicles', { search, page }],
    queryFn: () => vehiclesApi.list({ search: search || undefined, page, limit: 20 }),
  })

  const columns = [
    { key: 'licensePlate', header: 'Targa', render: (r: any) => <span className="font-mono font-semibold text-slate-800">{r.licensePlate}</span> },
    { key: 'customer', header: 'Proprietario', render: (r: any) => r.customer?.companyName || `${r.customer?.lastName || ''} ${r.customer?.firstName || ''}`.trim() || '—' },
    { key: 'brand', header: 'Marca/Modello', render: (r: any) => [r.brand, r.model, r.year].filter(Boolean).join(' ') || '—' },
    { key: 'fuelType', header: 'Alimentazione', render: (r: any) => r.fuelType || '—' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Veicoli</h1>
        <Button icon={<Plus size={16} />} onClick={() => navigate('/vehicles/new')}>Nuovo veicolo</Button>
      </div>
      <Card padding="none">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Cerca targa, marca..." className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        <Table columns={columns} data={data?.items || []} isLoading={isLoading}
          onRowClick={(r: any) => navigate(`/vehicles/${r.id}`)} emptyMessage="Nessun veicolo trovato" />
        {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} limit={data.meta.limit} onPageChange={setPage} />}
      </Card>
    </div>
  )
}
