import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, CheckCircle } from 'lucide-react'
import { tasksApi } from '../../api/tasks'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from '../../types'
import { format } from 'date-fns'

const STATUS_COLORS: Record<string, string> = {
  APERTO: 'bg-slate-100 text-slate-600',
  IN_CORSO: 'bg-blue-100 text-blue-700',
  COMPLETATO: 'bg-green-100 text-green-700',
  ANNULLATO: 'bg-red-100 text-red-700',
}

export const TasksPage: React.FC = () => {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', { status: statusFilter, priority: priorityFilter }],
    queryFn: () => tasksApi.list({ status: statusFilter || undefined, priority: priorityFilter || undefined, limit: 200 }),
  })

  const { register, handleSubmit, reset } = useForm<any>({
    defaultValues: { status: 'APERTO', priority: 'MEDIA' },
  })

  const createMutation = useMutation({
    mutationFn: (d: any) => tasksApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      setModal(false)
      reset()
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => tasksApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const items: any[] = data?.items || data || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Task</h1>
        <Button icon={<Plus size={16} />} onClick={() => setModal(true)}>Nuovo task</Button>
      </div>

      <Card>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Tutti gli stati</option>
            {Object.entries(TASK_STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Tutte le priorità</option>
            {Object.entries(TASK_PRIORITY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </Card>

      <div className="space-y-2">
        {isLoading ? (
          <Card><p className="text-sm text-slate-400 py-8 text-center">Caricamento...</p></Card>
        ) : items.length === 0 ? (
          <Card><p className="text-sm text-slate-400 py-8 text-center">Nessun task trovato.</p></Card>
        ) : (
          items.map((task: any) => (
            <Card key={task.id} className="flex items-start gap-3">
              <button
                onClick={() =>
                  updateStatusMutation.mutate({
                    id: task.id,
                    status: task.status === 'COMPLETATO' ? 'APERTO' : 'COMPLETATO',
                  })
                }
                className="mt-0.5 flex-shrink-0 cursor-pointer"
              >
                <CheckCircle
                  size={20}
                  className={task.status === 'COMPLETATO' ? 'text-green-500' : 'text-slate-300 hover:text-green-400'}
                />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${task.status === 'COMPLETATO' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {task.title}
                  </span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[task.status]}`}>
                    {TASK_STATUS_LABELS[task.status as keyof typeof TASK_STATUS_LABELS]}
                  </span>
                  <span
                    className="inline-flex px-1.5 py-0.5 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: TASK_PRIORITY_COLORS[task.priority as keyof typeof TASK_PRIORITY_COLORS] }}
                  >
                    {TASK_PRIORITY_LABELS[task.priority as keyof typeof TASK_PRIORITY_LABELS]}
                  </span>
                  {task.dueDate && (
                    <span className="text-xs text-slate-400">
                      Scadenza: {format(new Date(task.dueDate), 'dd/MM/yyyy')}
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>
                )}
                {task.case && (
                  <p className="text-xs text-blue-500 mt-0.5">Pratica: {task.case.caseNumber}</p>
                )}
              </div>
              <button
                onClick={() => deleteMutation.mutate(task.id)}
                className="text-slate-300 hover:text-red-500 p-1 cursor-pointer flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </Card>
          ))
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Nuovo task">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-3">
          <Input label="Titolo *" {...register('title', { required: true })} />
          <Textarea label="Descrizione" rows={2} {...register('description')} />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priorità"
              options={Object.entries(TASK_PRIORITY_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              {...register('priority')}
            />
            <Input label="Scadenza" type="date" {...register('dueDate')} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModal(false)}>Annulla</Button>
            <Button type="submit" loading={createMutation.isPending}>Crea</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
