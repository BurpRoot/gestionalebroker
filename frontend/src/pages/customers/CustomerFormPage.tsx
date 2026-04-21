import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save } from 'lucide-react'
import { customersApi } from '../../api/customers'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Card } from '../../components/ui/Card'
import { PageLoader } from '../../components/ui/Spinner'

export const CustomerFormPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isEdit = !!id

  const { data: existing, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getById(id!),
    enabled: isEdit,
  })

  const { register, handleSubmit } = useForm({
    values: existing || undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: any) => isEdit ? customersApi.update(id!, data) : customersApi.create(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      navigate(`/customers/${res.id || id}`)
    },
  })

  if (isLoading) return <PageLoader />

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-slate-900">{isEdit ? 'Modifica cliente' : 'Nuovo cliente'}</h1>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Dati anagrafici</h3>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo"
              options={[
                { value: 'PERSONA_FISICA', label: 'Persona fisica' },
                { value: 'PERSONA_GIURIDICA', label: 'Persona giuridica' },
                { value: 'DITTA_INDIVIDUALE', label: 'Ditta individuale' },
              ]}
              {...register('type')}
            />
            <Input label="Ragione sociale" {...register('companyName')} />
            <Input label="Cognome" {...register('lastName')} />
            <Input label="Nome" {...register('firstName')} />
            <Input label="Codice fiscale" {...register('fiscalCode')} />
            <Input label="Partita IVA" {...register('vatNumber')} />
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Contatti</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Telefono" type="tel" {...register('phone')} />
            <Input label="Telefono 2" type="tel" {...register('phone2')} />
            <Input label="Email" type="email" {...register('email')} />
            <Input label="PEC" type="email" {...register('pec')} />
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Indirizzo</h3>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Indirizzo" className="col-span-3" {...register('address')} />
            <Input label="Città" className="col-span-1" {...register('city')} />
            <Input label="Provincia" maxLength={2} {...register('province')} />
            <Input label="CAP" {...register('postalCode')} />
          </div>
        </Card>

        {mutation.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            {(mutation.error as any)?.response?.data?.error || 'Errore durante il salvataggio'}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Annulla
          </Button>
          <Button type="submit" loading={mutation.isPending} icon={<Save size={16} />}>
            {isEdit ? 'Salva modifiche' : 'Crea cliente'}
          </Button>
        </div>
      </form>
    </div>
  )
}
