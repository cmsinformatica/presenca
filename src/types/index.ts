export interface Evento {
  id: string
  nome: string
  descricao: string
  data: string
  horario: string
  local: string
  organizadorId: string
  criadoEm: string
  atualizadoEm: string
}

export interface Participante {
  id: string
  nome: string
  email: string
  telefone?: string
  eventoId: string
  qrCode: string
  confirmado: boolean
  confirmadoEm?: string
  criadoEm: string
}

export interface CheckIn {
  id: string
  participanteId: string
  eventoId: string
  verificadoPor: string
  timestamp: string
  local?: string
}

export interface Stats {
  total: number
  confirmados: number
  compareceu: number
}