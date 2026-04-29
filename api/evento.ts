import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './lib/prisma'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // CORS
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  if (request.method === 'OPTIONS') {
    return response.status(200).end()
  }

  try {
    if (request.method === 'GET') {
      const { id } = request.query

      if (id) {
        const evento = await prisma.evento.findUnique({
          where: { id: String(id) },
          include: {
            participantes: true,
            checkins: true
          }
        })
        if (!evento) {
          return response.status(404).json({ error: 'Evento não encontrado' })
        }
        return response.status(200).json(evento)
      }

      // Listar todos os eventos
      const eventos = await prisma.evento.findMany({
        include: {
          participantes: true,
          checkins: true
        }
      })
      
      // Mapear os dados para retornar a propriedade stats como o frontend espera
      const formattedEventos = eventos.map((e: any) => ({
        ...e,
        stats: {
          total: e.participantes.length,
          confirmados: e.participantes.filter((p: any) => p.confirmado).length,
          compareceu: e.checkins.length
        }
      }))
      
      return response.status(200).json(formattedEventos)
    }

    if (request.method === 'POST') {
      const { nome, descricao, data, horario, local, organizadorId } = request.body

      if (!nome || !data || !horario || !local) {
        return response.status(400).json({ error: 'Campos obrigatórios: nome, data, horario, local' })
      }

      const evento = await prisma.evento.create({
        data: {
          nome,
          descricao: descricao || '',
          data,
          horario,
          local,
          organizadorId: organizadorId || '1'
        }
      })

      return response.status(201).json({
        ...evento,
        stats: { total: 0, confirmados: 0, compareceu: 0 }
      })
    }

    if (request.method === 'PUT') {
      const { id } = request.query
      if (!id) return response.status(400).json({ error: 'ID obrigatório' })

      const updates = request.body
      const updated = await prisma.evento.update({
        where: { id: String(id) },
        data: updates
      })

      return response.status(200).json(updated)
    }

    if (request.method === 'DELETE') {
      const { id } = request.query
      if (!id) return response.status(400).json({ error: 'ID obrigatório' })

      await prisma.evento.delete({
        where: { id: String(id) }
      })
      return response.status(200).json({ success: true })
    }

    return response.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('API Error:', error)
    return response.status(500).json({ error: 'Erro no servidor', details: error.message })
  }
}
