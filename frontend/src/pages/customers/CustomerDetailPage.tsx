import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Pencil, Car, FileText } from 'lucide-react'
import { customersApi } from '../../api/customers'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { CaseStatusBadge } from '../../components/ui/Badge'
import { PageLoader } from '../../components/ui/Spinner'

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'dati' | 'pratiche'>('dati')

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getById(id!),
  })

  if (isLoading) return <PageLoader />
  if (!customer) return <div className="text-slate-500">Cliente non trovato</div>

  const fullName = customer.companyName || `${customer.lastName || ''} ${customer.firstName || ''}`.trim()

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{fullName || '—'}</h1>
            <p className="text-sm text-slate-500">{customer.fiscalCode || customer.phone || ''}</p>
          </div>
        </div>
        <Button variant="outline" icon={<Pencil size={14} />} onClick={() => navigate(`/customers/${id}/edit`)}>
          Modifica
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {(['dati', 'pratiche'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer capitalize
              ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t === 'dati' ? 'Dati' : `Pratiche (${customer.cases?.length || 0})`}
          </button>
        ))}
      </div>

      {tab === 'dati' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Anagrafica</h3>
            <dl className="space-y-2 text-sm">
              {[
                ['Tipo', customer.type],
                ['Cognome', customer.lastName],
                ['Nome', customer.firstName],
                ['Ragione sociale', customer.companyName],
                ['Codice fiscale', customer.fiscalCode],
                ['P.IVA', customer.vatNumber],
              ].map(([label, val]) => val ? (
                <div key={label} className="flex gap-2">
                  <dt className="text-slate-500 w-28 shrink-0">{label}</dt>
                  <dd className="text-slate-800 font-medium">{val}</dd>
                </div>
              ) : null)}
            </dl>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Contatti & Indirizzo</h3>
            <dl className="space-y-2 text-sm">
              {[
                ['Telefono', customer.phone],
                ['Tel. 2', customer.phone2],
                ['Email', customer.email],
                ['PEC', customer.pec],
                ['Indirizzo', customer.address],
                ['Città', customer.city ? `${customer.city} (${customer.province || ''}) ${customer.postalCode || ''}` : null],
              ].map(([label, val]) => val ? (
                <div key={label} className="flex gap-2">
                  <dt className="text-slate-500 w-28 shrink-0">{label}</dt>
                  <dd className="text-slate-800 font-medium">{val}</dd>
                </div>
              ) : null)}
            </dl>
          </Card>
          {customer.vehicles?.length > 0 && (
            <Card className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Car size={14} /> Veicoli</h3>
              <div className="flex flex-wrap gap-2">
                {customer.vehicles.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => navigate(`/vehicles/${v.id}`)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-mono text-slate-700 cursor-pointer"
                  >
                    {v.licensePlate} {v.brand && `— ${v.brand} ${v.model || ''}`}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'pratiche' && (
        <Card padding="none">
          <div className="divide-y divide-slate-100">
            {customer.cases?.length === 0 && (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">Nessuna pratica</div>
            )}
            {customer.cases?.map((c: any) => (
              <div
                key={c.id}
                onClick={() => navigate(`/cases/${c.id}`)}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 cursor-pointer"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">{c.caseNumber}</div>
                  <div className="text-xs text-slate-500">
                    {c.caseType || '—'} · {c.partner?.name || '—'} · {c.vehicle?.licensePlate || '—'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {c.grossPremium && (
                    <span className="text-sm font-semibold text-green-600">
                      €{Number(c.grossPremium).toFixed(2)}
                    </span>
                  )}
                  <CaseStatusBadge status={c.status} />
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 flex justify-end">
            <Button size="sm" icon={<FileText size={14} />} onClick={() => navigate(`/cases/new?customerId=${id}`)}>
              Nuova pratica
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
