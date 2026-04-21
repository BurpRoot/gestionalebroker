import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save } from 'lucide-react'
import { vehiclesApi } from '../../api/vehicles'
import { customersApi } from '../../api/customers'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Card } from '../../components/ui/Card'
import { PageLoader } from '../../components/ui/Spinner'

export const VehicleFormPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isEdit = !!id

  const { data: existing, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehiclesApi.getById(id!),
    enabled: isEdit,
  })

  const { data: customers } = useQuery({ queryKey: ['customers-all'], queryFn: () => customersApi.list({ limit: 500 }) })
  const { register, handleSubmit } = useForm({ values: existing ? { ...existing, customerId: existing.customer?.id } : undefined })

  const mutation = useMutation({
    mutationFn: (data: any) => isEdit ? vehiclesApi.update(id!, data) : vehiclesApi.create(data),
    onSuccess: (res) => { qc.invalidateQueries({ queryKey: ['vehicles'] }); navigate(`/vehicles/${res.id || id}`) },
  })

  if (isLoading) return <PageLoader />

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><ArrowLeft size={18} /></button>
        <h1 className="text-xl font-bold text-slate-900">{isEdit ? 'Modifica veicolo' : 'Nuovo veicolo'}</h1>
      </div>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Targa *" className="uppercase" {...register('licensePlate', { required: true })} />
            <Select label="Proprietario *" options={customers?.items?.map((c: any) => ({ value: c.id, label: c.companyName || `${c.lastName || ''} ${c.firstName || ''}`.trim() })) || []}
              placeholder="Seleziona..." {...register('customerId', { required: true })} />
            <Input label="Marca" {...register('brand')} />
            <Input label="Modello" {...register('model')} />
            <Input label="Anno" type="number" {...register('year')} />
            <Input label="Telaio (VIN)" {...register('vin')} />
            <Select label="Alimentazione" options={[
              { value: 'benzina', label: 'Benzina' }, { value: 'diesel', label: 'Diesel' },
              { value: 'gpl', label: 'GPL' }, { value: 'metano', label: 'Metano' },
              { value: 'elettrico', label: 'Elettrico' }, { value: 'ibrido', label: 'Ibrido' },
            ]} placeholder="Seleziona..." {...register('fuelType')} />
            <Input label="Uso" placeholder="privato, lavoro..." {...register('usage')} />
          </div>
        </Card>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Annulla</Button>
          <Button type="submit" loading={mutation.isPending} icon={<Save size={16} />}>{isEdit ? 'Salva' : 'Crea veicolo'}</Button>
        </div>
      </form>
    </div>
  )
}
