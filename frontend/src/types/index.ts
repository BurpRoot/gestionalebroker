export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}

export type CaseStatus =
  | 'BOZZA'
  | 'IN_LAVORAZIONE'
  | 'IN_ATTESA_DOCUMENTI'
  | 'IN_ATTESA_COMPAGNIA'
  | 'EMESSA'
  | 'PAGATA'
  | 'RINNOVATA'
  | 'ANNULLATA'

export type TaskStatus = 'APERTO' | 'IN_CORSO' | 'COMPLETATO' | 'ANNULLATO'
export type TaskPriority = 'BASSA' | 'MEDIA' | 'ALTA' | 'URGENTE'
export type UserRole = 'ADMIN' | 'DIREZIONE' | 'OPERATORE' | 'CONTABILITA' | 'COLLABORATORE' | 'VIEWER'

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  BOZZA: 'Bozza',
  IN_LAVORAZIONE: 'In lavorazione',
  IN_ATTESA_DOCUMENTI: 'Att. documenti',
  IN_ATTESA_COMPAGNIA: 'Att. compagnia',
  EMESSA: 'Emessa',
  PAGATA: 'Pagata',
  RINNOVATA: 'Rinnovata',
  ANNULLATA: 'Annullata',
}

export const CASE_STATUS_COLORS: Record<CaseStatus, string> = {
  BOZZA: '#94a3b8',
  IN_LAVORAZIONE: '#3b82f6',
  IN_ATTESA_DOCUMENTI: '#f59e0b',
  IN_ATTESA_COMPAGNIA: '#8b5cf6',
  EMESSA: '#06b6d4',
  PAGATA: '#22c55e',
  RINNOVATA: '#10b981',
  ANNULLATA: '#ef4444',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  APERTO: 'Aperto',
  IN_CORSO: 'In corso',
  COMPLETATO: 'Completato',
  ANNULLATO: 'Annullato',
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  BASSA: 'Bassa',
  MEDIA: 'Media',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
}

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  BASSA: '#94a3b8',
  MEDIA: '#3b82f6',
  ALTA: '#f59e0b',
  URGENTE: '#ef4444',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Amministratore',
  DIREZIONE: 'Direzione',
  OPERATORE: 'Operatore',
  CONTABILITA: 'Contabilità',
  COLLABORATORE: 'Collaboratore',
  VIEWER: 'Sola lettura',
}

export const CASE_TYPES = [
  'WAKAM',
  'CVT',
  'ASSIST STRAD',
  'RINNOVO',
  'N.POLIZZA',
  'II SEM',
  'EPOCA N.E.',
  'EPOCA RINNOVO',
  'SOSTITUZIONE',
  'FINANZIAMENTO',
  'RIATTIVAZIONE',
  'RIMBORSO',
  'ANNULLAMENTO',
]

export const PAYMENT_FREQUENCIES = ['annuale', 'semestrale', 'mensile', 'unico']

export const DOCUMENT_TYPES = [
  { value: 'POLIZZA', label: 'Polizza' },
  { value: 'QUIETANZA', label: 'Quietanza' },
  { value: 'CARTA_IDENTITA', label: 'Carta d\'identità' },
  { value: 'PATENTE', label: 'Patente' },
  { value: 'LIBRETTO', label: 'Libretto' },
  { value: 'CONTABILE_BONIFICO', label: 'Contabile bonifico' },
  { value: 'RICEVUTA_POS', label: 'Ricevuta POS' },
  { value: 'RICEVUTA_CONTANTI', label: 'Ricevuta contanti' },
  { value: 'CARTA_VERDE', label: 'Carta verde' },
  { value: 'ATTESTATO_RISCHIO', label: 'Attestato rischio' },
  { value: 'MODULO_PRIVACY', label: 'Modulo privacy' },
  { value: 'DISTINTA_PAGAMENTO', label: 'Distinta pagamento' },
  { value: 'ALTRO', label: 'Altro' },
]
