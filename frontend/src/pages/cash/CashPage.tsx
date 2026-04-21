import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cashApi } from '../../api/cash'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Modal } from '../../components/ui/Modal'
import { Textarea } from '../../components/ui/Textarea'
import { format } from 'date-fns'

const MOVEMENT_CATEGORIES = [
  { value: 'INCASSO_PREMIO', label: 'Incasso premio' },
  { value: 'PAGAMENTO_COMPAGNIA', label: 'Pagamento compagnia' },
  { value: 'PROVVIGIONE_COLLABORATORE', label: 'Provvigione collaboratore' },
  { value: 'SPESA_OPERATIVA', label: 'Spesa operativa' },
  { value: 'TRASFERIMENTO', label: 'Trasferimento' },
  { value: 'ALTRO', label: 'Altro' },
]

const fmt = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)

export const CashPage: React.FC = () => {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filters, setFilters] = useState({ type: '', cashAccountId: '', month: '' })

  const { data: movements, isLoading } = useQuery({
    queryKey: ['cash-movements', filters],
    queryFn: () => cashApi.getMovements({ ...filters, limit: 200 }),
  })

  const { data: accounts } = useQuery({
    queryKey: ['cash-accounts'],
    queryFn: () => cashApi.getAccounts(),
  })

  const { data: summary } = useQuery({
    queryKey: ['cash-summary', filters],
    queryFn: () => cashApi.getSummary(filters),
  })

  const { register, handleSubmit, reset } = useForm<any>({
    defaultValues: { movementDate: format(new Date(), 'yyyy-MM-dd'), type: 'ENTRATA' },
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => cashApi.createMovement(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cash-movements'] })
      qc.invalidateQueries({ queryKey: ['cash-summary'] })
      setModal(false)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cashApi.deleteMovement(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cash-movements'] })
      qc.invalidateQueries({ queryKey: ['cash-summary'] })
      setDeleteId(null)
    },
  })

  const items: any[] = movements?.items || movements || []
  const accountOptions = (accounts || []).map((a: any) => ({ value: a.id, label: a.name }))

  const entrate = summary?.totalEntrate ?? items.filter((m: any) => m.type === 'ENTRATA').reduce((s: number, m: any) => s + Number(m.amount), 0)
  const uscite = summary?.totalUscite ?? items.filter((m: any) => m.type === 'USCITA').reduce((s: number, m: any) => s + Number(m.amount), 0)
  const margine = entrate - uscite

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Prima nota cassa</h1>
        <Button icon={<Plus size={16} />} onClick={() => setModal(true)}>Nuovo movimento</Button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Entrate</p>
            <p className="text-lg font-bold text-green-600">{fmt(entrate)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-50">
            <TrendingDown size={20} className="text-red-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Uscite</p>
            <p className="text-lg font-bold text-red-600">{fmt(uscite)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${margine >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <Minus size={20} className={margine >= 0 ? 'text-blue-600' : 'text-orange-600'} />
          </div>
          <div>
            <p className="text-xs text-slate-500">Margine</p>
            <p className={`text-lg font-bold ${margine >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{fmt(margine)}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-3 gap-3">
          <select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Tutti i tipi</option>
            <option value="ENTRATA">Entrate</option>
            <option value="USCITA">Uscite</option>
          </select>
          <select
            value={filters.cashAccountId}
            onChange={(e) => setFilters((f) => ({ ...f, cashAccountId: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Tutti i conti</option>
            {(accounts || []).map((a: any) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <input
            type="month"
            value={filters.month}
            onChange={(e) => setFilters((f) => ({ ...f, month: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        {isLoading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Caricamento...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">Nessun movimento trovato.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-slate-500 text-xs">
                  <th className="text-left pb-2 font-medium">Data</th>
                  <th className="text-left pb-2 font-medium">Tipo</th>
                  <th className="text-left pb-2 font-medium">Categoria</th>
                  <th className="text-left pb-2 font-medium">Descrizione</th>
                  <th className="text-left pb-2 font-medium">Conto</th>
                  <th className="text-right pb-2 font-medium">Importo</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-2.5">
                      {m.movementDate ? format(new Date(m.movementDate), 'dd/MM/yyyy') : '—'}
                    </td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        m.type === 'ENTRATA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-600">
                      {MOVEMENT_CATEGORIES.find((c) => c.value === m.category)?.label || m.category}
                    </td>
                    <td className="py-2.5 text-slate-700 max-w-xs truncate">{m.description || '—'}</td>
                    <td className="py-2.5 text-slate-500">{m.cashAccount?.name || '—'}</td>
                    <td className={`py-2.5 text-right font-semibold ${
                      m.type === 'ENTRATA' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {m.type === 'USCITA' ? '-' : '+'}{fmt(Number(m.amount))}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => setDeleteId(m.id)}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* New movement modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Nuovo movimento">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-3">
          <Select
            label="Tipo *"
            options={[
              { value: 'ENTRATA', label: 'Entrata' },
              { value: 'USCITA', label: 'Uscita' },
            ]}
            {...register('type', { required: true })}
          />
          <Select
            label="Categoria *"
            options={MOVEMENT_CATEGORIES}
            placeholder="Seleziona categoria"
            {...register('category', { required: true })}
          />
          <Input label="Importo (€) *" type="number" step="0.01" min="0" {...register('amount', { required: true })} />
          <Input label="Data *" type="date" {...register('movementDate', { required: true })} />
          <Select
            label="Conto *"
            options={accountOptions}
            placeholder="Seleziona conto"
            {...register('cashAccountId', { required: true })}
          />
          <Input label="Riferimento" {...register('reference')} />
          <Textarea label="Descrizione" rows={2} {...register('description')} />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModal(false)}>Annulla</Button>
            <Button type="submit" loading={createMutation.isPending}>Salva</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Conferma eliminazione">
        <p className="text-sm text-slate-600 mb-4">Eliminare questo movimento? L'operazione non è reversibile.</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Annulla</Button>
          <Button variant="destructive" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteId!)}>
            Elimina
          </Button>
        </div>
      </Modal>
    </div>
  )
}
