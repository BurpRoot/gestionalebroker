import api from './client'

export const casesApi = {
  list: (params?: any) => api.get('/cases', { params }).then((r) => r.data),
  getById: (id: string) => api.get(`/cases/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/cases', data).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/cases/${id}`, data).then((r) => r.data),
  updateStatus: (id: string, status: string, note?: string) =>
    api.patch(`/cases/${id}/status`, { status, note }).then((r) => r.data),
  addNote: (id: string, note: string) =>
    api.post(`/cases/${id}/notes`, { note }).then((r) => r.data),
  getEvents: (id: string) => api.get(`/cases/${id}/events`).then((r) => r.data),
}
