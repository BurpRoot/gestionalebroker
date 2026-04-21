import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Search, Filter } from 'lucide-react'
import { casesApi } from '../../api/cases'
import { partnersApi } from '../../api/partners'
import { collaboratorsApi } from '../../api/collaborators'
import { Table, Pagination } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { CaseStatusBadge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

const fmt = (n: any) => n != null ? `€${Number(n).toFixed(2)}` : '—'
const fmtDate = (d: any) => d ? format(new Date(d), 'dd/MM/yy', { locale: it }) : '—'

export const CasesPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [partnerId, setPartnerId] = useState('')
  const [collaboratorId, setCollaboratorId] = useState('')
  const [caseType] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['cases', { search, page, status, partnerId, collaboratorId, caseType }],
    queryFn: () => casesApi.list({
      search: search || undefined,
      status: status || undefined,
      partnerId: partnerId || undefined,
      collaboratorId: collaboratorId || undefined,
      caseType: caseType || undefined,
      page,
      limit: 25,
    }),
  })

  const { data: partners } = useQuery({ queryKey: ['partners-all'], queryFn: () => partnersApi.list({ limit: 200 }) })
  const { data: collabs } = useQuery({ queryKey: ['collabs-all'], queryFn: () => collaboratorsApi.list({ limit: 200 }) })

  const columns = [
    { key: 'caseNumber', header: 'N. Pratica', render: (r: any) => <span className="font-mono text-xs">{r.caseNumber}</span> },
    {
      key: 'customer',
      header: 'Cliente',
      render: (r: any) => (
        <div>
          <div className="font-medium">{r.customer?.companyName || `${r.customer?.lastName || ''} ${r.customer?.firstName || ''}`.trim() || '—'}</div>
          {r.vehicle && <div className="text-xs font-mono text-slate-500">{r.vehicle.licensePlate}</div>}
        </div>
      ),
    },
    { key: 'caseType', header: 'Tipo', render: (r: any) => r.caseType || '—' },
    { key: 'partner', header: 'Partner', render: (r: any) => r.partner?.name || '—' },
    { key: 'collaborator', header: 'Collaboratore', render: (r: any) => r.collaborator ? `${r.collaborator.lastName} ${r.collaborator.firstName}` : '—' },
    { key: 'grossPremium', header: 'Entrata', render: (r: any) => <span className="text-green-600 font-medium">{fmt(r.grossPremium)}</span> },
    { key: 'partnerCost', header: 'Uscita', render: (r: any) => <span className="text-red-500">{fmt(r.partnerCost)}</span> },
    {
      key: 'margin',
      header: 'Margine',
      render: (r: any) => {
        const m = (Number(r.grossPremium || 0) - Number(r.partnerCost || 0) - Number(r.additionalCosts || 0))
        return <span className={m < 0 ? 'text-red-600 font-semibold' : 'text-blue-600 font-medium'}>€{m.toFixed(2)}</span>
      },
    },
    { key: 'expiryDate', header: 'Scadenza', render: (r: any) => fmtDate(r.expiryDate) },
    { key: 'status', header: 'Stato', render: (r: any) => <CaseStatusBadge status={r.status} /> },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Pratiche</h1>
        <Button icon={<Plus size={16} />} onClick={() => navigate('/cases/new')}>
          Nuova pratica
        </Button>
      </div>

      <Card padding="none">
        {/* Search + filters */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Cerca pratica, cliente, targa..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 cursor-pointer">
            <Filter size={14} /> Filtri
          </button>
        </div>

        {showFilters && (
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-3">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Tutti gli stati</option>
              {['BOZZA', 'IN_LAVORAZIONE', 'IN_ATTESA_DOCUMENTI', 'IN_ATTESA_COMPAGNIA', 'EMESSA', 'PAGATA', 'RINNOVATA', 'ANNULLATA'].map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <select
              value={partnerId}
              onChange={(e) => { setPartnerId(e.target.value); setPage(1) }}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Tutti i partner</option>
              {partners?.items?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select
              value={collaboratorId}
              onChange={(e) => { setCollaboratorId(e.target.value); setPage(1) }}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Tutti i collaboratori</option>
              {collabs?.items?.map((c: any) => <option key={c.id} value={c.id}>{c.lastName} {c.firstName}</option>)}
            </select>
            {(status || partnerId || collaboratorId) && (
              <button onClick={() => { setStatus(''); setPartnerId(''); setCollaboratorId(''); setPage(1) }} className="text-xs text-red-500 hover:underline cursor-pointer">
                Rimuovi filtri
              </button>
            )}
          </div>
        )}

        <Table
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
          onRowClick={(r: any) => navigate(`/cases/${r.id}`)}
          emptyMessage="Nessuna pratica trovata"
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
    </div>
  )
}
