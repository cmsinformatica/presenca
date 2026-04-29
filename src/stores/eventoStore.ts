import { create } from 'zustand'

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
  fetchEventos: () => Promise<void>
  setEventoAtual: (evento: Evento | null) => void
  addEvento: (evento: Evento) => Promise<Evento | undefined>
  updateEvento: (id: string, updates: Partial<Evento>) => Promise<void>
  removeEvento: (id: string) => Promise<void>
}

export const useEventoStore = create<EventoState>()((set, get) => ({
  eventos: [],
  eventoAtual: null,
  loading: false,
  error: null,
  
  fetchEventos: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch('/api/evento')
      if (!res.ok) throw new Error('Falha ao carregar eventos')
      const data = await res.json()
      set({ eventos: data, loading: false })
    } catch (err: any) {
      set({ error: err.message, loading: false })
    }
  },

  setEventoAtual: (evento) => set({ eventoAtual: evento }),

  addEvento: async (eventoData) => {
    const res = await fetch('/api/evento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventoData),
    })
    if (!res.ok) {
      let errStr = 'Erro ao criar evento'
      try {
        const errData = await res.json()
        errStr += `: ${errData.details || errData.error || res.statusText}`
      } catch (e) {}
      throw new Error(errStr)
    }
    const data = await res.json()
    set((state) => ({ eventos: [...state.eventos, data] }))
    return data
  },

  updateEvento: async (id, updates) => {
    try {
      const res = await fetch(`/api/evento?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Erro ao atualizar evento')
      const data = await res.json()
      set((state) => ({
        eventos: state.eventos.map((e) => (e.id === id ? { ...e, ...data } : e)),
        eventoAtual: state.eventoAtual?.id === id ? { ...state.eventoAtual, ...data } : state.eventoAtual
      }))
    } catch (err: any) {
      console.error(err)
    }
  },

  removeEvento: async (id) => {
    try {
      const res = await fetch(`/api/evento?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao deletar evento')
      set((state) => ({
        eventos: state.eventos.filter((e) => e.id !== id),
        eventoAtual: state.eventoAtual?.id === id ? null : state.eventoAtual
      }))
    } catch (err: any) {
      console.error(err)
    }
  },
}))