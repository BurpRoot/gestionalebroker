import api from './client'

export const usersApi = {
  list: (params?: any) => api.get('/users', { params }).then((r) => r.data),
  getById: (id: string) => api.get(`/users/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/users', data).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data).then((r) => r.data),
  resetPassword: (id: string, newPassword: string) =>
    api.post(`/users/${id}/reset-password`, { newPassword }).then((r) => r.data),
}
