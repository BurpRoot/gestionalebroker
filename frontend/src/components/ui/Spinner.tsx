import React from 'react'

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <div
      className={`${sizes[size]} border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin ${className}`}
    />
  )
}

export const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-48">
    <Spinner size="lg" />
  </div>
)
