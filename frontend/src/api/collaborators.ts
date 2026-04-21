import api from './client'

export const collaboratorsApi = {
  list: (params?: any) => api.get('/collaborators', { params }).then((r) => r.data),
  getById: (id: string) => api.get(`/collaborators/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/collaborators', data).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/collaborators/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/collaborators/${id}`).then((r) => r.data),
  upsertCommissionRule: (id: string, data: any) =>
    api.post(`/collaborators/${id}/commission-rules`, data).then((r) => r.data),
}
