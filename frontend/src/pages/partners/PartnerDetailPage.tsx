import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Pencil } from 'lucide-react'
import { partnersApi } from '../../api/partners'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageLoader } from '../../components/ui/Spinner'

export const PartnerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: p, isLoading } = useQuery({ queryKey: ['partner', id], queryFn: () => partnersApi.getById(id!) })

  if (isLoading) return <PageLoader />
  if (!p) return <div>Partner non trovato</div>

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><ArrowLeft size={18} /></button>
          <h1 className="text-xl font-bold text-slate-900">{p.name}</h1>
        </div>
        <Button variant="outline" icon={<Pencil size={14} />} onClick={() => navigate(`/partners/${id}/edit`)}>Modifica</Button>
      </div>
      <Card>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {[['Tipo', p.type], ['Codice', p.code], ['Telefono', p.phone], ['Email', p.email], ['PEC', p.pec], ['IBAN', p.iban], ['Referente', p.contactName], ['Giorni pag.', p.paymentTermsDays]]
            .filter(([, v]) => v).map(([label, val]) => (
              <div key={label}><dt className="text-slate-500 text-xs">{label}</dt><dd className="font-medium">{val}</dd></div>
            ))}
        </dl>
      </Card>
    </div>
  )
}
