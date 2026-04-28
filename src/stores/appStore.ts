import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Evento, Participante } from '../types'

interface AppState {
  eventos: Evento[]
  currentEvento: Evento | null
  participantes: Participante[]
  isOffline: boolean
  setEventos: (eventos: Evento[]) => void
  setCurrentEvento: (evento: Evento | null) => void
  setParticipantes: (participantes: Participante[]) => void
  addParticipante: (participante: Participante) => void
  updateParticipante: (id: string, data: Partial<Participante>) => void
  setOffline: (offline: boolean) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      eventos: [],
      currentEvento: null,
      participantes: [],
      isOffline: false,
      setEventos: (eventos) => set({ eventos }),
      setCurrentEvento: (evento) => set({ currentEvento: evento }),
      setParticipantes: (participantes) => set({ participantes }),
      addParticipante: (participante) =>
        set((state) => ({ participantes: [...state.participantes, participante] })),
      updateParticipante: (id, data) =>
        set((state) => ({
          participantes: state.participantes.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),
      setOffline: (offline) => set({ isOffline: offline }),
    }),
    {
      name: 'presenca-storage',
    }
  )
)