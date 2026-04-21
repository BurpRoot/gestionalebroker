import api from './client'

export const paymentBatchesApi = {
  list: (params?: any) => api.get('/payment-batches', { params }).then((r) => r.data),
  getById: (id: string) => api.get(`/payment-batches/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/payment-batches', data).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/payment-batches/${id}/status`, { status }).then((r) => r.data),
  addItem: (id: string, data: any) =>
    api.post(`/payment-batches/${id}/items`, data).then((r) => r.data),
  removeItem: (batchId: string, itemId: string) =>
    api.delete(`/payment-batches/${batchId}/items/${itemId}`).then((r) => r.data),
}
