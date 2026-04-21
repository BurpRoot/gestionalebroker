import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Pencil, ChevronRight, Upload, Plus } from 'lucide-react'
import { casesApi } from '../../api/cases'
import { documentsApi } from '../../api/documents'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { CaseStatusBadge, TaskStatusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { PageLoader } from '../../components/ui/Spinner'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { DOCUMENT_TYPES } from '../../types'

const fmtDate = (d: any) => d ? format(new Date(d), 'dd/MM/yyyy', { locale: it }) : '—'
const fmtMoney = (n: any) => n != null ? `€${Number(n).toFixed(2)}` : '—'

const STATUS_TRANSITIONS: Record<string, string[]> = {
  BOZZA: ['IN_LAVORAZIONE', 'ANNULLATA'],
  IN_LAVORAZIONE: ['IN_ATTESA_DOCUMENTI', 'IN_ATTESA_COMPAGNIA', 'EMESSA', 'ANNULLATA'],
  IN_ATTESA_DOCUMENTI: ['IN_LAVORAZIONE', 'IN_ATTESA_COMPAGNIA', 'EMESSA', 'ANNULLATA'],
  IN_ATTESA_COMPAGNIA: ['EMESSA', 'ANNULLATA'],
  EMESSA: ['PAGATA', 'ANNULLATA'],
  PAGATA: ['RINNOVATA', 'ANNULLATA'],
  RINNOVATA: ['PAGATA'],
  ANNULLATA: [],
}

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState<'dati' | 'movimenti' | 'documenti' | 'task' | 'storia'>('dati')
  const [noteModal, setNoteModal] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [statusModal, setStatusModal] = useState(false)
  const [uploadModal, setUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadType, setUploadType] = useState('ALTRO')

  const { data: c, isLoading } = useQuery({
    queryKey: ['case', id],
    queryFn: () => casesApi.getById(id!),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, note }: any) => casesApi.updateStatus(id!, status, note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['case', id] }); setStatusModal(false) },
  })

  const addNoteMutation = useMutation({
    mutationFn: (note: string) => casesApi.addNote(id!, note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['case', id] }); setNoteModal(false); setNoteText('') },
  })

  const uploadMutation = useMutation({
    mutationFn: () => documentsApi.upload(uploadFile!, id!, uploadType),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['case', id] }); setUploadModal(false); setUploadFile(null) },
  })

  if (isLoading) return <PageLoader />
  if (!c) return <div className="text-slate-500">Pratica non trovata</div>

  const margin = (Number(c.grossPremium || 0) - Number(c.partnerCost || 0) - Number(c.additionalCosts || 0))
  const transitions = STATUS_TRANSITIONS[c.status] || []

  return (
    <div className="max-w-5xl space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-mono">{c.caseNumber}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <CaseStatusBadge status={c.status} />
              {c.caseType && <span className="text-xs text-slate-500">{c.caseType}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {transitions.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setStatusModal(true)}>
              Cambia stato
            </Button>
          )}
          <Button variant="outline" size="sm" icon={<Pencil size={14} />} onClick={() => navigate(`/cases/${id}/edit`)}>
            Modifica
          </Button>
        </div>
      </div>

      {/* Financial Summary Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <div className="text-xs text-green-600 font-medium">Entrata</div>
          <div className="text-lg font-bold text-green-700">{fmtMoney(c.grossPremium)}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <div className="text-xs text-red-500 font-medium">Uscita</div>
          <div className="text-lg font-bold text-red-600">{fmtMoney(c.partnerCost)}</div>
        </div>
        <div className={`${margin >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'} border rounded-xl p-3 text-center`}>
          <div className={`text-xs font-medium ${margin >= 0 ? 'text-blue-600' : 'text-red-500'}`}>Margine</div>
          <div className={`text-lg font-bold ${margin >= 0 ? 'text-blue-700' : 'text-red-600'}`}>€{margin.toFixed(2)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {(['dati', 'movimenti', 'documenti', 'task', 'storia'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer capitalize
              ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t === 'movimenti' ? `Movimenti (${c.cashMovements?.length || 0})`
              : t === 'documenti' ? `Documenti (${c.documents?.length || 0})`
              : t === 'task' ? `Task (${c.tasks?.filter((t: any) => t.status !== 'COMPLETATO').length || 0})`
              : t === 'storia' ? `Storia (${c.events?.length || 0})`
              : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab: Dati */}
      {tab === 'dati' && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Cliente & Veicolo</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="text-slate-500 w-24">Cliente</dt>
                <dd>
                  <button onClick={() => navigate(`/customers/${c.customer?.id}`)} className="text-blue-600 hover:underline cursor-pointer">
                    {c.customer?.companyName || `${c.customer?.lastName || ''} ${c.customer?.firstName || ''}`.trim() || '—'}
                  </button>
                </dd>
              </div>
              {c.vehicle && (
                <div className="flex gap-2">
                  <dt className="text-slate-500 w-24">Targa</dt>
                  <dd>
                    <button onClick={() => navigate(`/vehicles/${c.vehicle?.id}`)} className="font-mono text-blue-600 hover:underline cursor-pointer">
                      {c.vehicle.licensePlate}
                    </button>
                    {c.vehicle.brand && <span className="text-slate-500 ml-1">{c.vehicle.brand} {c.vehicle.model}</span>}
                  </dd>
                </div>
              )}
              {c.partner && (
                <div className="flex gap-2">
                  <dt className="text-slate-500 w-24">Partner</dt>
                  <dd className="font-medium">{c.partner.name}</dd>
                </div>
              )}
              {c.collaborator && (
                <div className="flex gap-2">
                  <dt className="text-slate-500 w-24">Collaboratore</dt>
                  <dd className="font-medium">{c.collaborator.lastName} {c.collaborator.firstName}</dd>
                </div>
              )}
            </dl>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Polizza</h3>
            <dl className="space-y-2 text-sm">
              {[
                ['Tipo', c.caseType],
                ['Frazionamento', c.paymentFrequency],
                ['Decorrenza', fmtDate(c.effectDate)],
                ['Scadenza', fmtDate(c.expiryDate)],
                ['Pag. IN', c.paymentInReference || c.paymentInMethod],
                ['Pag. OUT', c.paymentOutReference || c.paymentOutMethod],
                ['Conto', c.bankAccount],
              ].map(([label, val]) => val ? (
                <div key={label} className="flex gap-2">
                  <dt className="text-slate-500 w-28">{label}</dt>
                  <dd className="font-medium">{val}</dd>
                </div>
              ) : null)}
            </dl>
          </Card>
          {c.notes && (
            <Card className="col-span-2">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Note</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{c.notes}</p>
            </Card>
          )}
        </div>
      )}

      {/* Tab: Movimenti */}
      {tab === 'movimenti' && (
        <Card padding="none">
          <div className="p-3 flex justify-end border-b border-slate-100">
            <Button size="sm" icon={<Plus size={14} />} onClick={() => navigate(`/cash?caseId=${id}`)}>
              Aggiungi movimento
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {c.cashMovements?.length === 0 && (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">Nessun movimento</div>
            )}
            {c.cashMovements?.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{m.description}</div>
                  <div className="text-xs text-slate-500">{fmtDate(m.movementDate)} · {m.cashAccount?.name}</div>
                </div>
                <span className={`text-sm font-bold ${m.type === 'ENTRATA' ? 'text-green-600' : 'text-red-500'}`}>
                  {m.type === 'ENTRATA' ? '+' : '-'}€{Number(m.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab: Documenti */}
      {tab === 'documenti' && (
        <Card padding="none">
          <div className="p-3 flex justify-end border-b border-slate-100">
            <Button size="sm" icon={<Upload size={14} />} onClick={() => setUploadModal(true)}>
              Carica documento
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {c.documents?.length === 0 && (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">Nessun documento</div>
            )}
            {c.documents?.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{d.fileName}</div>
                  <div className="text-xs text-slate-500">{d.documentType} · {fmtDate(d.uploadedAt)}</div>
                </div>
                <a
                  href={documentsApi.getDownloadUrl(d.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Scarica
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab: Task */}
      {tab === 'task' && (
        <Card padding="none">
          <div className="p-3 flex justify-end border-b border-slate-100">
            <Button size="sm" icon={<Plus size={14} />} onClick={() => navigate(`/tasks?caseId=${id}`)}>
              Nuovo task
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {c.tasks?.length === 0 && (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">Nessun task</div>
            )}
            {c.tasks?.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{t.title}</div>
                  {t.dueDate && <div className="text-xs text-slate-500">Scadenza: {fmtDate(t.dueDate)}</div>}
                </div>
                <TaskStatusBadge status={t.status} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab: Storia */}
      {tab === 'storia' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={() => setNoteModal(true)}>Aggiungi nota</Button>
          </div>
          <div className="space-y-2">
            {c.events?.map((ev: any) => (
              <div key={ev.id} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                <div className="flex-1 bg-white border border-slate-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-slate-800">{ev.description}</p>
                    <span className="text-xs text-slate-400 shrink-0 ml-2">{fmtDate(ev.createdAt)}</span>
                  </div>
                  {ev.user && (
                    <p className="text-xs text-slate-500 mt-1">{ev.user.firstName} {ev.user.lastName}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Modal */}
      <Modal open={statusModal} onClose={() => setStatusModal(false)} title="Cambia stato pratica" size="sm">
        <div className="space-y-3">
          {transitions.map((s) => (
            <button
              key={s}
              onClick={() => updateStatusMutation.mutate({ status: s })}
              className="w-full px-4 py-2.5 text-left text-sm border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between"
            >
              <CaseStatusBadge status={s} />
              <ChevronRight size={14} className="text-slate-400" />
            </button>
          ))}
        </div>
      </Modal>

      {/* Note Modal */}
      <Modal open={noteModal} onClose={() => setNoteModal(false)} title="Aggiungi nota" size="sm">
        <div className="space-y-4">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Inserisci nota..."
            rows={4}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setNoteModal(false)}>Annulla</Button>
            <Button size="sm" loading={addNoteMutation.isPending} onClick={() => addNoteMutation.mutate(noteText)}>
              Salva nota
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Modal */}
      <Modal open={uploadModal} onClose={() => setUploadModal(false)} title="Carica documento" size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Tipo documento</label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none"
            >
              {DOCUMENT_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">File</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setUploadModal(false)}>Annulla</Button>
            <Button
              size="sm"
              loading={uploadMutation.isPending}
              disabled={!uploadFile}
              icon={<Upload size={14} />}
              onClick={() => uploadMutation.mutate()}
            >
              Carica
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
