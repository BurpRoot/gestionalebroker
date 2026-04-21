import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save } from 'lucide-react'
import { collaboratorsApi } from '../../api/collaborators'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Card } from '../../components/ui/Card'
import { PageLoader } from '../../components/ui/Spinner'

export const CollaboratorFormPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isEdit = !!id

  const { data: existing, isLoading } = useQuery({
    queryKey: ['collaborator', id], queryFn: () => collaboratorsApi.getById(id!), enabled: isEdit,
  })

  const { register, handleSubmit } = useForm({ values: existing || undefined })
  const mutation = useMutation({
    mutationFn: (data: any) => isEdit ? collaboratorsApi.update(id!, data) : collaboratorsApi.create(data),
    onSuccess: (res) => { qc.invalidateQueries({ queryKey: ['collaborators'] }); navigate(`/collaborators/${res.id || id}`) },
  })

  if (isLoading) return <PageLoader />

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><ArrowLeft size={18} /></button>
        <h1 className="text-xl font-bold text-slate-900">{isEdit ? 'Modifica collaboratore' : 'Nuovo collaboratore'}</h1>
      </div>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cognome *" {...register('lastName', { required: true })} />
            <Input label="Nome *" {...register('firstName', { required: true })} />
            <Input label="Codice fiscale" {...register('fiscalCode')} />
            <Input label="Telefono" {...register('phone')} />
            <Input label="Email" type="email" {...register('email')} />
            <Input label="IBAN" {...register('iban')} />
            <Input label="Provvigione default" type="number" step="0.01" {...register('defaultCommission')} />
            <Select label="Tipo provvigione" options={[
              { value: 'PERCENTUALE', label: 'Percentuale %' },
              { value: 'FISSO', label: 'Importo fisso €' },
            ]} {...register('commissionType')} />
          </div>
        </Card>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Annulla</Button>
          <Button type="submit" loading={mutation.isPending} icon={<Save size={16} />}>{isEdit ? 'Salva' : 'Crea'}</Button>
        </div>
      </form>
    </div>
  )
}
