import api from './client'

export const cashApi = {
  getMovements: (params?: any) => api.get('/cash/movements', { params }).then((r) => r.data),
  createMovement: (data: any) => api.post('/cash/movements', data).then((r) => r.data),
  updateMovement: (id: string, data: any) => api.put(`/cash/movements/${id}`, data).then((r) => r.data),
  deleteMovement: (id: string) => api.delete(`/cash/movements/${id}`).then((r) => r.data),
  getSummary: (params?: any) => api.get('/cash/summary', { params }).then((r) => r.data),
  getAccounts: () => api.get('/cash/accounts').then((r) => r.data),
  createAccount: (data: any) => api.post('/cash/accounts', data).then((r) => r.data),
}
