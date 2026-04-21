import api from './client'

export const dashboardApi = {
  kpis: () => api.get('/dashboard/kpis').then((r) => r.data),
  casesByStatus: () => api.get('/dashboard/cases-by-status').then((r) => r.data),
  revenueTrend: () => api.get('/dashboard/revenue-trend').then((r) => r.data),
  topPartners: () => api.get('/dashboard/top-partners').then((r) => r.data),
  topCollaborators: () => api.get('/dashboard/top-collaborators').then((r) => r.data),
}
