import axios from 'axios'
import { useAuthStore } from '../store/auth.store'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginPage = window.location.pathname === '/login'
    const hasUser = !!useAuthStore.getState().user
    if (error.response?.status === 401 && !isLoginPage && !hasUser) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default apiClient
