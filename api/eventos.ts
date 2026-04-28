import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const { ORGANIZADOR_ID } = process.env

  if (request.method === 'GET') {
    const organizadoresId = request.query.organizadorId as string || ORGANIZADOR_ID

    if (!organizadoresId) {
      return response.status(400).json({ error: 'organizadorId required' })
    }

    try {
      const eventos = await prisma.evento.findMany({
        where: { organizadorId: organizadoresId },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { participantes: true } },
        },
      })

      const eventosWithStats = await Promise.all(
        eventos.map(async (evento) => {
          const confirmados = await prisma.participante.count({
            where: { eventoId: evento.id, confirmado: true },
          })
          const compareceu = await prisma.checkIn.count({
            where: { eventoId: evento.id },
          })

          return {
            ...evento,
            stats: {
              total: evento._count.participantes,
              confirmados,
              compareceu,
            },
          }
        })
      )

      return response.status(200).json(eventosWithStats)
    } catch (error) {
      console.error('Error:', error)
      return response.status(500).json({ error: 'Internal error' })
    }
  }

  if (request.method === 'POST') {
    const { nome, descricao, data, horario, local, organizadorId } = request.body

    if (!nome || !data || !horario || !local || !organizadorId) {
      return response.status(400).json({ error: 'Dados incompletos' })
    }

    try {
      const evento = await prisma.evento.create({
        data: {
          nome,
          descricao,
          data: new Date(data),
          horario,
          local,
          organizadorId,
        },
      })

      return response.status(201).json(evento)
    } catch (error) {
      console.error('Error:', error)
      return response.status(500).json({ error: 'Internal error' })
    }
  }

  return response.status(405).json({ error: 'Method not allowed' })
}