import api from './client'

export const partnersApi = {
  list: (params?: any) => api.get('/partners', { params }).then((r) => r.data),
  getById: (id: string) => api.get(`/partners/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/partners', data).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/partners/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/partners/${id}`).then((r) => r.data),
}
