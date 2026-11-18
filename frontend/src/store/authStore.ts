import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loginRequest, logoutRequest, meRequest } from '../features/auth/api'
import type { Usuario } from '../features/auth/types'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      login: async (username, password) => {
        await loginRequest({ username, password })
        const usuario = await meRequest()
        set({ usuario, cargando: false })
      },
      logout: async () => {
        try {
          await logoutRequest()
        } finally {
          set({ usuario: null, cargando: false })
        }
      },
      checkSession: async () => {
        set({ cargando: true })
        try {
          const usuario = await meRequest()
          set({ usuario, cargando: false })
        } catch {
          set({ usuario: null, cargando: false })
        }
      },
      clearSession: () => set({ usuario: null, cargando: false }),
    }),
    {
      name: 'foodstore-auth',
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)