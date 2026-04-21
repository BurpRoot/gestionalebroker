import api from './client'

export const tasksApi = {
  list: (params?: any) => api.get('/tasks', { params }).then((r) => r.data),
  create: (data: any) => api.post('/tasks', data).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/tasks/${id}/status`, { status }).then((r) => r.data),
  delete: (id: string) => api.delete(`/tasks/${id}`).then((r) => r.data),
}
