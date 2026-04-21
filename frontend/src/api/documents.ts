import api from './client'

export const documentsApi = {
  getByCaseId: (caseId: string) => api.get(`/documents/case/${caseId}`).then((r) => r.data),

  upload: (file: File, caseId: string, documentType: string, description?: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('caseId', caseId)
    form.append('documentType', documentType)
    if (description) form.append('description', description)
    return api.post('/documents', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
  },

  getDownloadUrl: (id: string) => `${import.meta.env.VITE_API_BASE_URL}/documents/${id}/download`,

  delete: (id: string) => api.delete(`/documents/${id}`).then((r) => r.data),
}
