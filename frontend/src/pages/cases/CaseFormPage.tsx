import React from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save } from 'lucide-react'
import { casesApi } from '../../api/cases'
import { customersApi } from '../../api/customers'
import { vehiclesApi } from '../../api/vehicles'
import { partnersApi } from '../../api/partners'
import { collaboratorsApi } from '../../api/collaborators'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { Card } from '../../components/ui/Card'
import { PageLoader } from '../../components/ui/Spinner'
import { CASE_TYPES, PAYMENT_FREQUENCIES } from '../../types'

export const CaseFormPage: React.FC = () => {
  const { id } = useParams()
  const [sp] = useSearchParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isEdit = !!id

  const { data: existing, isLoading: loadingCase } = useQuery({
    queryKey: ['case', id],
    queryFn: () => casesApi.getById(id!),
    enabled: isEdit,
  })

  const { data: customers } = useQuery({ queryKey: ['customers-all'], queryFn: () => customersApi.list({ limit: 500 }) })
  const { data: partners } = useQuery({ queryKey: ['partners-all'], queryFn: () => partnersApi.list({ limit: 200 }) })
  const { data: collabs } = useQuery({ queryKey: ['collabs-all'], queryFn: () => collaboratorsApi.list({ limit: 200 }) })

  const { register, handleSubmit, watch } = useForm({
    values: existing ? {
      ...existing,
      effectDate: existing.effectDate ? existing.effectDate.slice(0, 10) : '',
      expiryDate: existing.expiryDate ? existing.expiryDate.slice(0, 10) : '',
      customerId: existing.customer?.id || '',
      vehicleId: existing.vehicle?.id || '',
      partnerId: existing.partner?.id || '',
      collaboratorId: existing.collaborator?.id || '',
    } : { customerId: sp.get('customerId') || '' },
  })

  const selectedCustomerId = watch('customerId')
  const { data: customerVehicles } = useQuery({
    queryKey: ['vehicles', { customerId: selectedCustomerId }],
    queryFn: () => vehiclesApi.list({ customerId: selectedCustomerId, limit: 50 }),
    enabled: !!selectedCustomerId,
  })

  const mutation = useMutation({
    mutationFn: (data: any) => isEdit ? casesApi.update(id!, data) : casesApi.create(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['cases'] })
      navigate(`/cases/${res.id || id}`)
    },
  })

  if (loadingCase) return <PageLoader />

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-slate-900">{isEdit ? 'Modifica pratica' : 'Nuova pratica'}</h1>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Soggetti</h3>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Cliente *"
              options={customers?.items?.map((c: any) => ({
                value: c.id,
                label: c.companyName || `${c.lastName || ''} ${c.firstName || ''}`.trim(),
              })) || []}
              placeholder="Seleziona cliente..."
              {...register('customerId', { required: true })}
            />
            <Select
              label="Veicolo / Targa"
              options={customerVehicles?.items?.map((v: any) => ({
                value: v.id,
                label: v.licensePlate + (v.brand ? ` — ${v.brand} ${v.model || ''}` : ''),
              })) || []}
              placeholder="Seleziona veicolo..."
              {...register('vehicleId')}
            />
            <Select
              label="Partner / Compagnia"
              options={partners?.items?.map((p: any) => ({ value: p.id, label: p.name })) || []}
              placeholder="Seleziona partner..."
              {...register('partnerId')}
            />
            <Select
              label="Collaboratore"
              options={collabs?.items?.map((c: any) => ({
                value: c.id,
                label: `${c.lastName} ${c.firstName}`,
              })) || []}
              placeholder="Seleziona collaboratore..."
              {...register('collaboratorId')}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Dati pratica</h3>
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Tipo pratica"
              options={CASE_TYPES.map((t) => ({ value: t, label: t }))}
              placeholder="Seleziona tipo..."
              {...register('caseType')}
            />
            <Select
              label="Frazionamento"
              options={PAYMENT_FREQUENCIES.map((f) => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }))}
              placeholder="Seleziona..."
              {...register('paymentFrequency')}
            />
            <Input label="Data decorrenza" type="date" {...register('effectDate')} />
            <Input label="Data scadenza" type="date" {...register('expiryDate')} />
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Importi</h3>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Entrata cliente (€)" type="number" step="0.01" {...register('grossPremium')} />
            <Input label="Uscita partner (€)" type="number" step="0.01" {...register('partnerCost')} />
            <Input label="Costi aggiuntivi (€)" type="number" step="0.01" {...register('additionalCosts')} />
            <Input label="Provvigione collaboratore (€)" type="number" step="0.01" {...register('collaboratorCommissionValue')} />
            <Input label="Quota cassa Scudieri (€)" type="number" step="0.01" {...register('scudieriAmount')} />
            <Input label="Quota cassa Mobility (€)" type="number" step="0.01" {...register('mobilityAmount')} />
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Tracciabilità pagamenti</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Metodo pagamento IN" {...register('paymentInMethod')} />
            <Input label="Riferimento pagamento IN" {...register('paymentInReference')} />
            <Input label="Metodo pagamento OUT" {...register('paymentOutMethod')} />
            <Input label="Riferimento pagamento OUT" {...register('paymentOutReference')} />
            <Input label="Conto corrente" {...register('bankAccount')} />
          </div>
        </Card>

        <Card>
          <Textarea label="Note" rows={3} {...register('notes')} />
        </Card>

        {mutation.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            {(mutation.error as any)?.response?.data?.error || 'Errore durante il salvataggio'}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Annulla</Button>
          <Button type="submit" loading={mutation.isPending} icon={<Save size={16} />}>
            {isEdit ? 'Salva modifiche' : 'Crea pratica'}
          </Button>
        </div>
      </form>
    </div>
  )
}
