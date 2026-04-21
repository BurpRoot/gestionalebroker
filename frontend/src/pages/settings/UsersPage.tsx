import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Key } from 'lucide-react'
import { usersApi } from '../../api/users'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { ROLE_LABELS } from '../../types'
import { format } from 'date-fns'

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  DIREZIONE: 'bg-blue-100 text-blue-700',
  OPERATORE: 'bg-cyan-100 text-cyan-700',
  CONTABILITA: 'bg-orange-100 text-orange-700',
  COLLABORATORE: 'bg-green-100 text-green-700',
  VIEWER: 'bg-slate-100 text-slate-600',
}

export const UsersPage: React.FC = () => {
  const qc = useQueryClient()
  const [createModal, setCreateModal] = useState(false)
  const [resetModal, setResetModal] = useState<string | null>(null)
  const [resetPassword, setResetPassword] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list({ limit: 100 }),
  })

  const { register, handleSubmit, reset } = useForm<any>({
    defaultValues: { role: 'OPERATORE', isActive: true },
  })

  const createMutation = useMutation({
    mutationFn: (d: any) => usersApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      setCreateModal(false)
      reset()
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersApi.update(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, pw }: { id: string; pw: string }) =>
      usersApi.resetPassword(id, pw),
    onSuccess: () => setResetModal(null),
  })

  const items: any[] = data?.items || data || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Gestione utenti</h1>
        <Button icon={<Plus size={16} />} onClick={() => setCreateModal(true)}>Nuovo utente</Button>
      </div>

      <Card>
        {isLoading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Caricamento...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">Nessun utente trovato.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-slate-500 text-xs">
                  <th className="text-left pb-2 font-medium">Nome</th>
                  <th className="text-left pb-2 font-medium">Email</th>
                  <th className="text-left pb-2 font-medium">Ruolo</th>
                  <th className="text-left pb-2 font-medium">Ultimo accesso</th>
                  <th className="text-center pb-2 font-medium">Attivo</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-medium">{u.lastName} {u.firstName}</td>
                    <td className="py-2.5 text-slate-600">{u.email}</td>
                    <td className="py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-600'}`}>
                        {ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] || u.role}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-500">
                      {u.lastLoginAt ? format(new Date(u.lastLoginAt), 'dd/MM/yyyy HH:mm') : 'Mai'}
                    </td>
                    <td className="py-2.5 text-center">
                      <button
                        onClick={() => toggleActiveMutation.mutate({ id: u.id, isActive: !u.isActive })}
                        className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${u.isActive ? 'bg-green-500' : 'bg-slate-300'}`}
                      >
                        <span className={`block w-4 h-4 bg-white rounded-full mx-auto shadow transition-transform ${u.isActive ? 'translate-x-2.5' : '-translate-x-2.5'}`} />
                      </button>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => setResetModal(u.id)}
                        className="text-slate-400 hover:text-blue-500 p-1 cursor-pointer"
                        title="Reset password"
                      >
                        <Key size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Nuovo utente">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Cognome *" {...register('lastName', { required: true })} />
            <Input label="Nome *" {...register('firstName', { required: true })} />
          </div>
          <Input label="Email *" type="email" {...register('email', { required: true })} />
          <Input label="Password *" type="password" {...register('password', { required: true })} />
          <Select
            label="Ruolo *"
            options={Object.entries(ROLE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            {...register('role', { required: true })}
          />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateModal(false)}>Annulla</Button>
            <Button type="submit" loading={createMutation.isPending}>Crea</Button>
          </div>
          {createMutation.isError && (
            <p className="text-xs text-red-600">Errore nella creazione. L'email potrebbe essere già in uso.</p>
          )}
        </form>
      </Modal>

      <Modal open={!!resetModal} onClose={() => setResetModal(null)} title="Reset password">
        <div className="space-y-3">
          <Input
            label="Nuova password *"
            type="password"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
          />
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setResetModal(null)}>Annulla</Button>
            <Button
              loading={resetPasswordMutation.isPending}
              disabled={resetPassword.length < 6}
              onClick={() => resetPasswordMutation.mutate({ id: resetModal!, pw: resetPassword })}
            >
              Salva
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
