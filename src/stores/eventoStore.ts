import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Evento {
  id: string
  nome: string
  descricao?: string
  data: string
  horario: string
  local: string
  organizadorId: string
  stats?: { total: number; confirmados: number; compareceu: number }
}

interface EventoState {
  eventos: Evento[]
  eventoAtual: Evento | null
  loading: boolean
  error: string | null
  setEventos: (eventos: Evento[]) => void
  setEventoAtual: (evento: Evento | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addEvento: (evento: Evento) => void
  updateEvento: (id: string, updates: Partial<Evento>) => void
  removeEvento: (id: string) => void
}

export const useEventoStore = create<EventoState>()(
  persist(
    (set) => ({
      eventos: [],
      eventoAtual: null,
      loading: false,
      error: null,
      setEventos: (eventos) => set({ eventos }),
      setEventoAtual: (evento) => set({ eventoAtual: evento }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      addEvento: (evento) => set((state) => ({ eventos: [...state.eventos, evento] })),
      updateEvento: (id, updates) =>
        set((state) => ({
          eventos: state.eventos.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),
      removeEvento: (id) =>
        set((state) => ({
          eventos: state.eventos.filter((e) => e.id !== id),
        })),
    }),
    { name: 'evento-storage', storage: createJSONStorage(() => localStorage) }
  )
)