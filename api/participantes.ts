import { VercelRequest, VercelResponse } from '@vercel/node'

// In-memory store para MVP
const participantes = new Map<string, any>()

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  if (request.method === 'OPTIONS') {
    return response.status(200).end()
  }

  if (request.method === 'GET') {
    const { eventoId, qrCode, id } = request.query

    if (id) {
      const p = participantes.get(id as string)
      if (!p) return response.status(404).json({ error: 'Participante não encontrado' })
      return response.status(200).json(p)
    }

    if (qrCode) {
      const found = Array.from(participantes.values()).find(p => p.qrCode === qrCode)
      if (!found) return response.status(404).json({ error: 'QR Code não encontrado' })
      return response.status(200).json(found)
    }

    if (eventoId) {
      const filtered = Array.from(participantes.values()).filter(p => p.eventoId === eventoId)
      return response.status(200).json(filtered)
    }

    return response.status(200).json(Array.from(participantes.values()))
  }

  if (request.method === 'POST') {
    const { nome, email, telefone, eventoId } = request.body

    if (!nome || !email || !eventoId) {
      return response.status(400).json({ error: 'Campos obrigatórios: nome, email, eventoId' })
    }

    const id = generateId()
    const qrCode = generateId()

    const participante = {
      id,
      nome,
      email,
      telefone: telefone || '',
      eventoId,
      qrCode,
      confirmado: false,
      confirmadoEm: null,
      checkins: [],
      criadoEm: new Date().toISOString(),
    }

    participantes.set(id, participante)
    return response.status(201).json(participante)
  }

  if (request.method === 'PUT') {
    const { id } = request.query
    if (!id) return response.status(400).json({ error: 'ID obrigatório' })

    const participante = participantes.get(id as string)
    if (!participante) return response.status(404).json({ error: 'Participante não encontrado' })

    const updates = request.body
    const updated = { ...participante, ...updates, id: participante.id }
    participantes.set(id as string, updated)

    return response.status(200).json(updated)
  }

  if (request.method === 'DELETE') {
    const { id } = request.query
    if (!id) return response.status(400).json({ error: 'ID obrigatório' })

    participantes.delete(id as string)
    return response.status(200).json({ success: true })
  }

  return response.status(405).json({ error: 'Method not allowed' })
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
