import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Organizador {
  id: string
  email: string
  nome: string
}

interface AuthState {
  organizador: Organizador | null
  token: string | null
  isAuthenticated: boolean
  login: (organizador: Organizador, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      organizador: null,
      token: null,
      isAuthenticated: false,
      login: (organizador, token) => set({ organizador, token, isAuthenticated: true }),
      logout: () => set({ organizador: null, token: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage', storage: createJSONStorage(() => localStorage) }
  )
)