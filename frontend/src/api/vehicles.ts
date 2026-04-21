import api from './client'

export const vehiclesApi = {
  list: (params?: any) => api.get('/vehicles', { params }).then((r) => r.data),
  getById: (id: string) => api.get(`/vehicles/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/vehicles', data).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/vehicles/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/vehicles/${id}`).then((r) => r.data),
}
