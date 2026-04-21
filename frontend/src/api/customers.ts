import api from './client'

export const customersApi = {
  list: (params?: Record<string, any>) =>
    api.get('/customers', { params }).then((r) => r.data),

  getById: (id: string) => api.get(`/customers/${id}`).then((r) => r.data),

  create: (data: any) => api.post('/customers', data).then((r) => r.data),

  update: (id: string, data: any) =>
    api.put(`/customers/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/customers/${id}`).then((r) => r.data),

  getCases: (id: string, params?: any) =>
    api.get(`/customers/${id}/cases`, { params }).then((r) => r.data),
}
