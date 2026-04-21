import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save } from 'lucide-react'
import { partnersApi } from '../../api/partners'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { PageLoader } from '../../components/ui/Spinner'

export const PartnerFormPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isEdit = !!id

  const { data: existing, isLoading } = useQuery({
    queryKey: ['partner', id], queryFn: () => partnersApi.getById(id!), enabled: isEdit,
  })

  const { register, handleSubmit } = useForm({ values: existing || undefined })
  const mutation = useMutation({
    mutationFn: (data: any) => isEdit ? partnersApi.update(id!, data) : partnersApi.create(data),
    onSuccess: (res) => { qc.invalidateQueries({ queryKey: ['partners'] }); navigate(`/partners/${res.id || id}`) },
  })

  if (isLoading) return <PageLoader />

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><ArrowLeft size={18} /></button>
        <h1 className="text-xl font-bold text-slate-900">{isEdit ? 'Modifica partner' : 'Nuovo partner'}</h1>
      </div>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nome *" {...register('name', { required: true })} />
            <Input label="Tipo" placeholder="compagnia, intermediario..." {...register('type')} />
            <Input label="Codice interno" {...register('code')} />
            <Input label="Telefono" {...register('phone')} />
            <Input label="Email" type="email" {...register('email')} />
            <Input label="PEC" type="email" {...register('pec')} />
            <Input label="IBAN" {...register('iban')} />
            <Input label="Giorni pagamento" type="number" {...register('paymentTermsDays')} />
            <Input label="Referente" className="col-span-2" {...register('contactName')} />
          </div>
        </Card>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Annulla</Button>
          <Button type="submit" loading={mutation.isPending} icon={<Save size={16} />}>{isEdit ? 'Salva' : 'Crea partner'}</Button>
        </div>
      </form>
    </div>
  )
}
