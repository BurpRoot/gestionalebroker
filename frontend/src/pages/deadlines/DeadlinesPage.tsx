import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, AlertTriangle } from 'lucide-react'
import api from '../../api/client'
import { tasksApi } from '../../api/tasks'
import { Card } from '../../components/ui/Card'
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '../../types'
import { format, differenceInDays, parseISO } from 'date-fns'

type Tab = 'polizze' | 'task'

const urgencyClass = (days: number) => {
  if (days < 0) return 'text-red-600 font-semibold'
  if (days <= 7) return 'text-orange-500 font-semibold'
  if (days <= 30) return 'text-yellow-600'
  return 'text-slate-500'
}

export const DeadlinesPage: React.FC = () => {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('polizze')

  const { data: deadlines, isLoading: loadingDeadlines } = useQuery({
    queryKey: ['deadlines'],
    queryFn: () => api.get('/deadlines').then((r) => r.data),
  })

  const { data: taskData, isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks-deadlines'],
    queryFn: () => tasksApi.list({ status: 'APERTO', limit: 200 }),
    enabled: tab === 'task',
  })

  const today = new Date()
  const policies: any[] = deadlines || []
  const tasks: any[] = taskData?.items || taskData || []
  const pendingTasks = tasks.filter((t: any) => t.dueDate && t.status !== 'COMPLETATO' && t.status !== 'ANNULLATO')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar size={20} className="text-slate-600" />
        <h1 className="text-xl font-bold text-slate-900">Scadenziario</h1>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {(['polizze', 'task'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'polizze' ? 'Scadenze polizze' : 'Task in scadenza'}
          </button>
        ))}
      </div>

      {tab === 'polizze' && (
        <Card>
          {loadingDeadlines ? (
            <p className="text-sm text-slate-400 py-8 text-center">Caricamento...</p>
          ) : policies.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">Nessuna scadenza trovata nei prossimi 90 giorni.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-slate-500 text-xs">
                    <th className="text-left pb-2 font-medium">Pratica</th>
                    <th className="text-left pb-2 font-medium">Cliente</th>
                    <th className="text-left pb-2 font-medium">Targa</th>
                    <th className="text-left pb-2 font-medium">Partner</th>
                    <th className="text-left pb-2 font-medium">Scadenza</th>
                    <th className="text-right pb-2 font-medium">Giorni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {policies.map((p: any) => {
                    const expiry = p.expiryDate ? parseISO(p.expiryDate) : null
                    const days = expiry ? differenceInDays(expiry, today) : null
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => navigate(`/cases/${p.id}`)}
                      >
                        <td className="py-2.5 font-mono text-xs">{p.caseNumber}</td>
                        <td className="py-2.5">
                          {p.customer ? `${p.customer.lastName} ${p.customer.firstName}` : '—'}
                        </td>
                        <td className="py-2.5 font-mono text-xs">{p.vehicle?.licensePlate || '—'}</td>
                        <td className="py-2.5 text-slate-500">{p.partner?.name || '—'}</td>
                        <td className="py-2.5">
                          {expiry ? format(expiry, 'dd/MM/yyyy') : '—'}
                        </td>
                        <td className={`py-2.5 text-right ${days !== null ? urgencyClass(days) : ''}`}>
                          {days !== null ? (
                            <span className="flex items-center justify-end gap-1">
                              {days < 0 && <AlertTriangle size={12} />}
                              {days < 0 ? `${Math.abs(days)}gg fa` : `${days}gg`}
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'task' && (
        <Card>
          {loadingTasks ? (
            <p className="text-sm text-slate-400 py-8 text-center">Caricamento...</p>
          ) : pendingTasks.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">Nessun task con scadenza imminente.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-slate-500 text-xs">
                    <th className="text-left pb-2 font-medium">Titolo</th>
                    <th className="text-left pb-2 font-medium">Stato</th>
                    <th className="text-left pb-2 font-medium">Priorità</th>
                    <th className="text-left pb-2 font-medium">Pratica</th>
                    <th className="text-left pb-2 font-medium">Scadenza</th>
                    <th className="text-right pb-2 font-medium">Giorni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingTasks
                    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .map((t: any) => {
                      const due = parseISO(t.dueDate)
                      const days = differenceInDays(due, today)
                      return (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="py-2.5 font-medium">{t.title}</td>
                          <td className="py-2.5 text-slate-500">
                            {TASK_STATUS_LABELS[t.status as keyof typeof TASK_STATUS_LABELS]}
                          </td>
                          <td className="py-2.5">
                            {TASK_PRIORITY_LABELS[t.priority as keyof typeof TASK_PRIORITY_LABELS]}
                          </td>
                          <td className="py-2.5">
                            {t.case ? (
                              <button
                                className="text-blue-500 hover:underline text-xs font-mono cursor-pointer"
                                onClick={() => navigate(`/cases/${t.case.id}`)}
                              >
                                {t.case.caseNumber}
                              </button>
                            ) : '—'}
                          </td>
                          <td className="py-2.5">{format(due, 'dd/MM/yyyy')}</td>
                          <td className={`py-2.5 text-right ${urgencyClass(days)}`}>
                            <span className="flex items-center justify-end gap-1">
                              {days < 0 && <AlertTriangle size={12} />}
                              {days < 0 ? `${Math.abs(days)}gg fa` : `${days}gg`}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
