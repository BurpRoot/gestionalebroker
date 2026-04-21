import api from './client'

export const importApi = {
  preview: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/import/preview', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
  },

  confirm: (importSessionId: string) =>
    api.post('/import/confirm', { importSessionId }).then((r) => r.data),
}
