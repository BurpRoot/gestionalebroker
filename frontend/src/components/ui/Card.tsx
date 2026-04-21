import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card: React.FC<CardProps> = ({ children, className = '', padding = 'md' }) => {
  const paddings = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-6' }
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${paddings[padding]} ${className}`}>
      {children}
    </div>
  )
}

export const CardHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode }> = ({
  title,
  subtitle,
  actions,
}) => (
  <div className="flex items-start justify-between mb-4">
    <div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
)
