import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit, Plus } from 'lucide-react'
import { collaboratorsApi } from '../../api/collaborators'
import { partnersApi } from '../../api/partners'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
import { PageLoader } from '../../components/ui/Spinner'
import { useForm } from 'react-hook-form'

export const CollaboratorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [ruleModal, setRuleModal] = useState(false)

  const { data: collaborator, isLoading } = useQuery({
    queryKey: ['collaborator', id],
    queryFn: () => collaboratorsApi.getById(id!),
  })

  const { data: partners } = useQuery({
    queryKey: ['partners', { limit: 200 }],
    queryFn: () => partnersApi.list({ limit: 200 }),
  })

  const { register, handleSubmit, reset } = useForm<any>()

  const upsertRule = useMutation({
    mutationFn: (data: any) => collaboratorsApi.upsertCommissionRule(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collaborator', id] })
      setRuleModal(false)
      reset()
    },
  })

  if (isLoading) return <PageLoader />
  if (!collaborator) return <div className="p-4 text-slate-500">Collaboratore non trovato.</div>

  const rules: any[] = collaborator.commissionRules || []

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-slate-900">
            {collaborator.lastName} {collaborator.firstName}
          </h1>
        </div>
        <Button variant="outline" icon={<Edit size={16} />} onClick={() => navigate(`/collaborators/${id}/edit`)}>
          Modifica
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Dati anagrafici</h2>
          <dl className="space-y-2 text-sm">
            {[
              ['Cognome', collaborator.lastName],
              ['Nome', collaborator.firstName],
              ['Codice fiscale', collaborator.fiscalCode],
              ['Telefono', collaborator.phone],
              ['Email', collaborator.email],
              ['IBAN', collaborator.iban],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-800">{value || '—'}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Provvigione default</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Tipo</dt>
              <dd className="font-medium">{collaborator.commissionType === 'PERCENTUALE' ? 'Percentuale %' : 'Importo fisso €'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Valore</dt>
              <dd className="font-medium">
                {collaborator.defaultCommission != null
                  ? collaborator.commissionType === 'PERCENTUALE'
                    ? `${collaborator.defaultCommission}%`
                    : `€ ${Number(collaborator.defaultCommission).toFixed(2)}`
                  : '—'}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">Regole provvigionali per partner</h2>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setRuleModal(true)}>
            Aggiungi regola
          </Button>
        </div>
        {rules.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">Nessuna regola specifica impostata.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-slate-500 text-xs">
                <th className="text-left pb-2">Partner</th>
                <th className="text-left pb-2">Linea prodotto</th>
                <th className="text-left pb-2">Tipo</th>
                <th className="text-right pb-2">Valore</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((r: any) => (
                <tr key={r.id} className="py-2">
                  <td className="py-2">{r.partner?.name || r.partnerId}</td>
                  <td className="py-2">{r.productLine || '—'}</td>
                  <td className="py-2">{r.commissionType === 'PERCENTUALE' ? '%' : '€'}</td>
                  <td className="py-2 text-right font-medium">
                    {r.commissionType === 'PERCENTUALE'
                      ? `${r.commissionValue}%`
                      : `€ ${Number(r.commissionValue).toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={ruleModal} onClose={() => setRuleModal(false)} title="Regola provvigionale">
        <form
          onSubmit={handleSubmit((d) => upsertRule.mutate(d))}
          className="space-y-3"
        >
          <Select
            label="Partner *"
            options={(partners?.items || []).map((p: any) => ({ value: p.id, label: p.name }))}
            placeholder="Seleziona partner"
            {...register('partnerId', { required: true })}
          />
          <Input label="Linea prodotto" {...register('productLine')} />
          <Select
            label="Tipo provvigione *"
            options={[
              { value: 'PERCENTUALE', label: 'Percentuale %' },
              { value: 'FISSO', label: 'Importo fisso €' },
            ]}
            {...register('commissionType', { required: true })}
          />
          <Input
            label="Valore *"
            type="number"
            step="0.01"
            {...register('commissionValue', { required: true })}
          />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setRuleModal(false)}>Annulla</Button>
            <Button type="submit" loading={upsertRule.isPending}>Salva</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
