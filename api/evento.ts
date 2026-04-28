import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method === 'GET') {
    const { id } = request.query

    if (!id) {
      return response.status(400).json({ error: 'ID required' })
    }

    try {
      const evento = await prisma.evento.findUnique({
        where: { id: id as string },
      })

      if (!evento) {
        return response.status(404).json({ error: 'Evento não encontrado' })
      }

      return response.status(200).json(evento)
    } catch (error) {
      console.error('Error:', error)
      return response.status(500).json({ error: 'Internal error' })
    }
  }

  return response.status(405).json({ error: 'Method not allowed' })
}