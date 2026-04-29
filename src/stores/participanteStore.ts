import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Participante {
  id: string
  nome: string
  email: string
  telefone?: string
  eventoId: string
  qrCode: string
  confirmado: boolean
  confirmadoEm?: string
  checkins?: CheckIn[]
}

export interface CheckIn {
  id: string
  participanteId: string
  eventoId: string
  verificadoPor: string
  timestamp: string
  local?: string
}

interface ParticipanteState {
  participantes: Participante[]
  loading: boolean
  error: string | null
  setParticipantes: (participantes: Participante[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addParticipante: (participante: Participante) => void
  addParticipantes: (participantes: Participante[]) => void
  updateParticipante: (id: string, updates: Partial<Participante>) => void
  removeParticipante: (id: string) => void
  confirmar: (id: string) => void
}

export const useParticipanteStore = create<ParticipanteState>()(
  persist(
    (set) => ({
      participantes: [],
      loading: false,
      error: null,
      setParticipantes: (participantes) => set({ participantes }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      addParticipante: (participante) =>
        set((state) => ({ participantes: [...state.participantes, participante] })),
      addParticipantes: (participantes) =>
        set((state) => ({ participantes: [...state.participantes, ...participantes] })),
      updateParticipante: (id, updates) =>
        set((state) => ({
          participantes: state.participantes.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      removeParticipante: (id) =>
        set((state) => ({
          participantes: state.participantes.filter((p) => p.id !== id),
        })),
      confirmar: (id) =>
        set((state) => ({
          participantes: state.participantes.map((p) =>
            p.id === id
              ? { ...p, confirmado: true, confirmadoEm: new Date().toISOString() }
              : p
          ),
        })),
    }),
    { name: 'participante-storage', storage: createJSONStorage(() => localStorage) }
  )
)