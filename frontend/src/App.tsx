import React, { useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { authApi } from './api/auth'
import { useAuthStore } from './store/auth.store'
import { PrivateRoute } from './router/PrivateRoute'
import { AppLayout } from './layouts/AppLayout'

import { LoginPage } from './pages/auth/LoginPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { CustomersPage } from './pages/customers/CustomersPage'
import { CustomerFormPage } from './pages/customers/CustomerFormPage'
import { CustomerDetailPage } from './pages/customers/CustomerDetailPage'
import { VehiclesPage } from './pages/vehicles/VehiclesPage'
import { VehicleFormPage } from './pages/vehicles/VehicleFormPage'
import { VehicleDetailPage } from './pages/vehicles/VehicleDetailPage'
import { PartnersPage } from './pages/partners/PartnersPage'
import { PartnerFormPage } from './pages/partners/PartnerFormPage'
import { PartnerDetailPage } from './pages/partners/PartnerDetailPage'
import { CollaboratorsPage } from './pages/collaborators/CollaboratorsPage'
import { CollaboratorFormPage } from './pages/collaborators/CollaboratorFormPage'
import { CollaboratorDetailPage } from './pages/collaborators/CollaboratorDetailPage'
import { CasesPage } from './pages/cases/CasesPage'
import { CaseFormPage } from './pages/cases/CaseFormPage'
import { CaseDetailPage } from './pages/cases/CaseDetailPage'
import { CashPage } from './pages/cash/CashPage'
import { PaymentBatchesPage } from './pages/payment-batches/PaymentBatchesPage'
import { PaymentBatchDetailPage } from './pages/payment-batches/PaymentBatchDetailPage'
import { TasksPage } from './pages/tasks/TasksPage'
import { DeadlinesPage } from './pages/deadlines/DeadlinesPage'
import { ImportPage } from './pages/import/ImportPage'
import { UsersPage } from './pages/settings/UsersPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'customers', element: <CustomersPage /> },
          { path: 'customers/new', element: <CustomerFormPage /> },
          { path: 'customers/:id', element: <CustomerDetailPage /> },
          { path: 'customers/:id/edit', element: <CustomerFormPage /> },
          { path: 'vehicles', element: <VehiclesPage /> },
          { path: 'vehicles/new', element: <VehicleFormPage /> },
          { path: 'vehicles/:id', element: <VehicleDetailPage /> },
          { path: 'vehicles/:id/edit', element: <VehicleFormPage /> },
          { path: 'partners', element: <PartnersPage /> },
          { path: 'partners/new', element: <PartnerFormPage /> },
          { path: 'partners/:id', element: <PartnerDetailPage /> },
          { path: 'partners/:id/edit', element: <PartnerFormPage /> },
          { path: 'collaborators', element: <CollaboratorsPage /> },
          { path: 'collaborators/new', element: <CollaboratorFormPage /> },
          { path: 'collaborators/:id', element: <CollaboratorDetailPage /> },
          { path: 'collaborators/:id/edit', element: <CollaboratorFormPage /> },
          { path: 'cases', element: <CasesPage /> },
          { path: 'cases/new', element: <CaseFormPage /> },
          { path: 'cases/:id', element: <CaseDetailPage /> },
          { path: 'cases/:id/edit', element: <CaseFormPage /> },
          { path: 'cash', element: <CashPage /> },
          { path: 'payment-batches', element: <PaymentBatchesPage /> },
          { path: 'payment-batches/:id', element: <PaymentBatchDetailPage /> },
          { path: 'tasks', element: <TasksPage /> },
          { path: 'deadlines', element: <DeadlinesPage /> },
          { path: 'import', element: <ImportPage /> },
          { path: 'settings/users', element: <UsersPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])

const AuthBootstrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    let cancelled = false
    authApi
      .me()
      .then((data) => { if (!cancelled) setUser(data.user) })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return <>{children}</>
}

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AuthBootstrap>
      <RouterProvider router={router} />
    </AuthBootstrap>
  </QueryClientProvider>
)

export default App
