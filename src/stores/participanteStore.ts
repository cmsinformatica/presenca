import { create } from 'zustand'

export interface Participante {
  id: string
  nome: string
  email: string
  telefone?: string
  eventoId: string
  qrCode: string
  confirmado: boolean
  confirmadoEm?: string
  checkins?: {
    id: string
    participanteId: string
    eventoId: string
    verificadoPor: string
    timestamp: string
  }[]
}

interface ParticipanteState {
  participantes: Participante[]
  loading: boolean
  error: string | null
  fetchParticipantes: (eventoId?: string) => Promise<void>
  addParticipante: (participante: Omit<Participante, 'id' | 'qrCode' | 'confirmado'>) => Promise<void>
  addParticipantes: (participantes: Omit<Participante, 'id' | 'qrCode' | 'confirmado'>[]) => Promise<void>
  updateParticipante: (id: string, updates: Partial<Participante>) => Promise<void>
  removeParticipante: (id: string) => Promise<void>
}

export const useParticipanteStore = create<ParticipanteState>()((set, get) => ({
  participantes: [],
  loading: false,
  error: null,

  fetchParticipantes: async (eventoId) => {
    set({ loading: true, error: null })
    try {
      const url = eventoId ? `/api/participantes?eventoId=${eventoId}` : '/api/participantes'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Falha ao carregar participantes')
      const data = await res.json()
      // Se tiver eventoId, substituímos apenas os desse evento, caso contrário substitui tudo
      set((state) => {
        if (!eventoId) return { participantes: data, loading: false }
        const outros = state.participantes.filter(p => p.eventoId !== eventoId)
        return { participantes: [...outros, ...data], loading: false }
      })
    } catch (err: any) {
      set({ error: err.message, loading: false })
    }
  },

  addParticipante: async (participanteData) => {
    try {
      const res = await fetch('/api/participantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(participanteData),
      })
      if (!res.ok) throw new Error('Erro ao adicionar participante')
      const data = await res.json()
      set((state) => ({ participantes: [...state.participantes, data] }))
    } catch (err: any) {
      console.error(err)
    }
  },

  addParticipantes: async (participantesData) => {
    try {
      // Bulk create enviando array pro endpoint POST
      const res = await fetch('/api/participantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(participantesData),
      })
      if (!res.ok) throw new Error('Erro ao importar participantes')
      
      // Como o backend não retorna todos de volta no bulk create, disparamos um refetch
      if (participantesData.length > 0) {
        get().fetchParticipantes(participantesData[0].eventoId)
      }
    } catch (err: any) {
      console.error(err)
    }
  },

  updateParticipante: async (id, updates) => {
    try {
      const res = await fetch(`/api/participantes?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Erro ao atualizar participante')
      const data = await res.json()
      set((state) => ({
        participantes: state.participantes.map((p) => (p.id === id ? { ...p, ...data } : p)),
      }))
    } catch (err: any) {
      console.error(err)
    }
  },

  removeParticipante: async (id) => {
    try {
      const res = await fetch(`/api/participantes?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao remover participante')
      set((state) => ({
        participantes: state.participantes.filter((p) => p.id !== id),
      }))
    } catch (err: any) {
      console.error(err)
    }
  },
}))