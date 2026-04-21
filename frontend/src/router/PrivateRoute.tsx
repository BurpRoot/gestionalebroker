import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { PageLoader } from '../components/ui/Spinner'

export const PrivateRoute: React.FC = () => {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}
