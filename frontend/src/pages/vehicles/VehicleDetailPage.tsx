import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Pencil } from 'lucide-react'
import { vehiclesApi } from '../../api/vehicles'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { CaseStatusBadge } from '../../components/ui/Badge'
import { PageLoader } from '../../components/ui/Spinner'

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: v, isLoading } = useQuery({ queryKey: ['vehicle', id], queryFn: () => vehiclesApi.getById(id!) })

  if (isLoading) return <PageLoader />
  if (!v) return <div className="text-slate-500">Veicolo non trovato</div>

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-mono">{v.licensePlate}</h1>
            <p className="text-sm text-slate-500">{[v.brand, v.model, v.year].filter(Boolean).join(' ')}</p>
          </div>
        </div>
        <Button variant="outline" icon={<Pencil size={14} />} onClick={() => navigate(`/vehicles/${id}/edit`)}>Modifica</Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Dati veicolo</h3>
          <dl className="space-y-2 text-sm">
            {[['Targa', v.licensePlate], ['Marca', v.brand], ['Modello', v.model], ['Anno', v.year], ['VIN', v.vin], ['Alimentazione', v.fuelType], ['Uso', v.usage]]
              .filter(([, val]) => val).map(([label, val]) => (
                <div key={label} className="flex gap-2"><dt className="text-slate-500 w-28">{label}</dt><dd className="font-medium">{val}</dd></div>
              ))}
          </dl>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Proprietario</h3>
          <button onClick={() => navigate(`/customers/${v.customer?.id}`)} className="text-blue-600 hover:underline text-sm cursor-pointer">
            {v.customer?.companyName || `${v.customer?.lastName || ''} ${v.customer?.firstName || ''}`.trim() || '—'}
          </button>
        </Card>
      </div>
      {v.cases?.length > 0 && (
        <Card padding="none">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">Pratiche ({v.cases.length})</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {v.cases.map((c: any) => (
              <div key={c.id} onClick={() => navigate(`/cases/${c.id}`)} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="text-sm font-mono font-medium">{c.caseNumber}</span>
                  <span className="text-xs text-slate-500 ml-2">{c.caseType || ''} · {c.partner?.name || ''}</span>
                </div>
                <CaseStatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
