import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { paymentBatchesApi } from '../../api/paymentBatches'
import { collaboratorsApi } from '../../api/collaborators'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { PageLoader } from '../../components/ui/Spinner'
import { format } from 'date-fns'

const STATUS_TRANSITIONS: Record<string, string[]> = {
  BOZZA: ['INVIATA'],
  INVIATA: ['CONFERMATA', 'PARZIALE'],
  PARZIALE: ['CONFERMATA'],
  CONFERMATA: [],
}

const STATUS_LABELS: Record<string, string> = {
  BOZZA: 'Bozza', INVIATA: 'Inviata', CONFERMATA: 'Confermata', PARZIALE: 'Parziale',
}

const STATUS_COLORS: Record<string, string> = {
  BOZZA: 'bg-slate-100 text-slate-600',
  INVIATA: 'bg-blue-100 text-blue-700',
  CONFERMATA: 'bg-green-100 text-green-700',
  PARZIALE: 'bg-orange-100 text-orange-700',
}

const fmt = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)

export const PaymentBatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [addItemModal, setAddItemModal] = useState(false)

  const { data: batch, isLoading } = useQuery({
    queryKey: ['payment-batch', id],
    queryFn: () => paymentBatchesApi.getById(id!),
  })

  const { data: collaborators } = useQuery({
    queryKey: ['collaborators', { limit: 200 }],
    queryFn: () => collaboratorsApi.list({ limit: 200 }),
  })

  const { register, handleSubmit, reset } = useForm<any>()

  const statusMutation = useMutation({
    mutationFn: (status: string) => paymentBatchesApi.updateStatus(id!, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payment-batch', id] }),
  })

  const addItemMutation = useMutation({
    mutationFn: (data: any) => paymentBatchesApi.addItem(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-batch', id] })
      setAddItemModal(false)
      reset()
    },
  })

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => paymentBatchesApi.removeItem(id!, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payment-batch', id] }),
  })

  if (isLoading) return <PageLoader />
  if (!batch) return <div className="p-4 text-slate-500">Distinta non trovata.</div>

  const items: any[] = batch.items || []
  const nextStatuses = STATUS_TRANSITIONS[batch.status] || []

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{batch.batchNumber}</h1>
            <p className="text-sm text-slate-500">{batch.partner?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[batch.status]}`}>
            {STATUS_LABELS[batch.status]}
          </span>
          {nextStatuses.map((s) => (
            <Button
              key={s}
              size="sm"
              variant="outline"
              loading={statusMutation.isPending}
              onClick={() => statusMutation.mutate(s)}
            >
              → {STATUS_LABELS[s]}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-slate-500">Totale</p>
          <p className="text-2xl font-bold text-slate-900">{fmt(Number(batch.totalAmount || 0))}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Voci</p>
          <p className="text-2xl font-bold text-slate-900">{items.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Pagate</p>
          <p className="text-2xl font-bold text-green-600">{items.filter((i: any) => i.isPaid).length}</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">Voci distinta</h2>
          {batch.status === 'BOZZA' && (
            <Button size="sm" icon={<Plus size={14} />} onClick={() => setAddItemModal(true)}>
              Aggiungi voce
            </Button>
          )}
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">Nessuna voce aggiunta.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-slate-500 text-xs">
                <th className="text-left pb-2 font-medium">Collaboratore</th>
                <th className="text-right pb-2 font-medium">Importo</th>
                <th className="text-center pb-2 font-medium">Pagato</th>
                <th className="text-left pb-2 font-medium">Data pag.</th>
                {batch.status === 'BOZZA' && <th className="pb-2" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-2.5">
                    {item.collaborator ? `${item.collaborator.lastName} ${item.collaborator.firstName}` : '— Generico —'}
                  </td>
                  <td className="py-2.5 text-right font-semibold">{fmt(Number(item.amount))}</td>
                  <td className="py-2.5 text-center">
                    <span className={`inline-flex w-5 h-5 rounded-full items-center justify-center text-xs ${
                      item.isPaid ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.isPaid ? '✓' : '○'}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-500">
                    {item.paidAt ? format(new Date(item.paidAt), 'dd/MM/yyyy') : '—'}
                  </td>
                  {batch.status === 'BOZZA' && (
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => removeItemMutation.mutate(item.id)}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={addItemModal} onClose={() => setAddItemModal(false)} title="Aggiungi voce">
        <form onSubmit={handleSubmit((d) => addItemMutation.mutate(d))} className="space-y-3">
          <Select
            label="Collaboratore"
            options={(collaborators?.items || []).map((c: any) => ({
              value: c.id,
              label: `${c.lastName} ${c.firstName}`,
            }))}
            placeholder="— Generico —"
            {...register('collaboratorId')}
          />
          <Input label="Importo (€) *" type="number" step="0.01" min="0" {...register('amount', { required: true })} />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddItemModal(false)}>Annulla</Button>
            <Button type="submit" loading={addItemMutation.isPending}>Aggiungi</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
