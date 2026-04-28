const API_URL = import.meta.env.VITE_API_URL || '/api'

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro na requisição' }))
    throw new Error(error.error || 'Erro na requisição')
  }

  return response.json()
}

export const api = {
  login: (email: string, senha: string) =>
    request<{ token: string; organizador: any }>('/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),

  getEventos: (organizadorId: string) =>
    request<any[]>('/eventos?organizadorId=' + organizadorId),

  createEvento: (data: any) =>
    request<any>('/eventos', { method: 'POST', body: JSON.stringify(data) }),

  getParticipantes: (eventoId: string) =>
    request<any[]>('/participantes?eventoId=' + eventoId),

  addParticipante: (data: any) =>
    request<any>('/participantes', { method: 'POST', body: JSON.stringify(data) }),

  confirmar: (qrCode: string, telefone: string) =>
    request<any>('/confirmar', { method: 'POST', body: JSON.stringify({ qrCode, telefone }) }),

  checkin: (qrCode: string) =>
    request<any>('/checkin', { method: 'POST', body: JSON.stringify({ qrCode }) }),
}