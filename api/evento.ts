import { VercelRequest, VercelResponse } from '@vercel/node'

// In-memory store para MVP (dados persistem enquanto a função está quente)
// Em produção, substituir por banco de dados
const eventos = new Map<string, any>()

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // CORS
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  if (request.method === 'OPTIONS') {
    return response.status(200).end()
  }

  if (request.method === 'GET') {
    const { id } = request.query

    if (id) {
      const evento = eventos.get(id as string)
      if (!evento) {
        return response.status(404).json({ error: 'Evento não encontrado' })
      }
      return response.status(200).json(evento)
    }

    // Listar todos
    const all = Array.from(eventos.values())
    return response.status(200).json(all)
  }

  if (request.method === 'POST') {
    const { nome, descricao, data, horario, local, organizadorId } = request.body

    if (!nome || !data || !horario || !local) {
      return response.status(400).json({ error: 'Campos obrigatórios: nome, data, horario, local' })
    }

    const id = generateId()
    const evento = {
      id,
      nome,
      descricao: descricao || '',
      data,
      horario,
      local,
      organizadorId: organizadorId || '1',
      criadoEm: new Date().toISOString(),
      stats: { total: 0, confirmados: 0, compareceu: 0 },
    }

    eventos.set(id, evento)
    return response.status(201).json(evento)
  }

  if (request.method === 'PUT') {
    const { id } = request.query
    if (!id) return response.status(400).json({ error: 'ID obrigatório' })

    const evento = eventos.get(id as string)
    if (!evento) return response.status(404).json({ error: 'Evento não encontrado' })

    const updates = request.body
    const updated = { ...evento, ...updates, id: evento.id }
    eventos.set(id as string, updated)

    return response.status(200).json(updated)
  }

  if (request.method === 'DELETE') {
    const { id } = request.query
    if (!id) return response.status(400).json({ error: 'ID obrigatório' })

    eventos.delete(id as string)
    return response.status(200).json({ success: true })
  }

  return response.status(405).json({ error: 'Method not allowed' })
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
