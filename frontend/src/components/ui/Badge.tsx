import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ children, color = '#3b82f6', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}40` }}
    >
      {children}
    </span>
  )
}

export const CaseStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    BOZZA: '#94a3b8',
    IN_LAVORAZIONE: '#3b82f6',
    IN_ATTESA_DOCUMENTI: '#f59e0b',
    IN_ATTESA_COMPAGNIA: '#8b5cf6',
    EMESSA: '#06b6d4',
    PAGATA: '#22c55e',
    RINNOVATA: '#10b981',
    ANNULLATA: '#ef4444',
  }
  const labels: Record<string, string> = {
    BOZZA: 'Bozza',
    IN_LAVORAZIONE: 'In lavorazione',
    IN_ATTESA_DOCUMENTI: 'Att. documenti',
    IN_ATTESA_COMPAGNIA: 'Att. compagnia',
    EMESSA: 'Emessa',
    PAGATA: 'Pagata',
    RINNOVATA: 'Rinnovata',
    ANNULLATA: 'Annullata',
  }
  return <Badge color={colors[status] || '#94a3b8'}>{labels[status] || status}</Badge>
}

export const TaskStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    APERTO: '#3b82f6',
    IN_CORSO: '#f59e0b',
    COMPLETATO: '#22c55e',
    ANNULLATO: '#94a3b8',
  }
  const labels: Record<string, string> = {
    APERTO: 'Aperto',
    IN_CORSO: 'In corso',
    COMPLETATO: 'Completato',
    ANNULLATO: 'Annullato',
  }
  return <Badge color={colors[status] || '#94a3b8'}>{labels[status] || status}</Badge>
}
