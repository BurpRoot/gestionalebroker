import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Eye } from 'lucide-react'
import { paymentBatchesApi } from '../../api/paymentBatches'
import { partnersApi } from '../../api/partners'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { format } from 'date-fns'

const STATUS_COLORS: Record<string, string> = {
  BOZZA: 'bg-slate-100 text-slate-600',
  INVIATA: 'bg-blue-100 text-blue-700',
  CONFERMATA: 'bg-green-100 text-green-700',
  PARZIALE: 'bg-orange-100 text-orange-700',
}

const fmt = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)

export const PaymentBatchesPage: React.FC = () => {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['payment-batches'],
    queryFn: () => paymentBatchesApi.list({ limit: 100 }),
  })

  const { data: partners } = useQuery({
    queryKey: ['partners', { limit: 200 }],
    queryFn: () => partnersApi.list({ limit: 200 }),
  })

  const { register, handleSubmit, reset } = useForm<any>()

  const createMutation = useMutation({
    mutationFn: (d: any) => paymentBatchesApi.create(d),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['payment-batches'] })
      setModal(false)
      reset()
      navigate(`/payment-batches/${res.id}`)
    },
  })

  const items: any[] = data?.items || data || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Distinte di pagamento</h1>
        <Button icon={<Plus size={16} />} onClick={() => setModal(true)}>Nuova distinta</Button>
      </div>

      <Card>
        {isLoading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Caricamento...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">Nessuna distinta trovata.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-slate-500 text-xs">
                  <th className="text-left pb-2 font-medium">Numero</th>
                  <th className="text-left pb-2 font-medium">Partner</th>
                  <th className="text-left pb-2 font-medium">Stato</th>
                  <th className="text-right pb-2 font-medium">Totale</th>
                  <th className="text-left pb-2 font-medium">Inviata</th>
                  <th className="text-left pb-2 font-medium">Confermata</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((b: any) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-mono text-xs">{b.batchNumber}</td>
                    <td className="py-2.5">{b.partner?.name || '—'}</td>
                    <td className="py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[b.status] || 'bg-slate-100 text-slate-600'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-semibold">{fmt(Number(b.totalAmount || 0))}</td>
                    <td className="py-2.5 text-slate-500">
                      {b.sentAt ? format(new Date(b.sentAt), 'dd/MM/yyyy') : '—'}
                    </td>
                    <td className="py-2.5 text-slate-500">
                      {b.confirmedAt ? format(new Date(b.confirmedAt), 'dd/MM/yyyy') : '—'}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => navigate(`/payment-batches/${b.id}`)}
                        className="text-blue-500 hover:text-blue-700 p-1 cursor-pointer"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Nuova distinta">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-3">
          <Select
            label="Partner *"
            options={(partners?.items || []).map((p: any) => ({ value: p.id, label: p.name }))}
            placeholder="Seleziona partner"
            {...register('partnerId', { required: true })}
          />
          <Textarea label="Note" rows={2} {...register('description')} />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModal(false)}>Annulla</Button>
            <Button type="submit" loading={createMutation.isPending}>Crea</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
