import axios from 'axios'
import { useAuthStore } from '../../store/authStore'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const url = error.config?.url ?? ''
      const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail
      const cuentaDesactivada = status === 400 && detail === 'cuenta de usuario desactivada'
      const sesionVencida = status === 401 && !url.includes('/auth/token') && !url.includes('/auth/me')
      if (cuentaDesactivada || sesionVencida) {
        useAuthStore.getState().clearSession()
      }
    }
    return Promise.reject(error)
  },
)