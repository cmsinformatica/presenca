import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'
import { sendNotification } from './notifications'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method === 'GET') {
    const { eventoId } = request.query

    if (!eventoId) {
      return response.status(400).json({ error: 'eventoId required' })
    }

    try {
      const participantes = await prisma.participante.findMany({
        where: { eventoId: eventoId as string },
        orderBy: { createdAt: 'desc' },
      })

      return response.status(200).json(participantes)
    } catch (error) {
      console.error('Error:', error)
      return response.status(500).json({ error: 'Internal error' })
    }
  }

  if (request.method === 'POST') {
    const { nome, email, telefone, eventoId, gerarLink } = request.body

    if (!nome || !email || !eventoId) {
      return response.status(400).json({ error: 'Dados incompletos' })
    }

    try {
      const qrCode = Buffer.from(`${eventoId}:${email}:${Date.now()}`).toString('base64')

      const participante = await prisma.participante.create({
        data: { nome, email, telefone, eventoId, qrCode },
      })

      if (gerarLink) {
        const evento = await prisma.evento.findUnique({ where: { id: eventoId } })
        const link = `${process.env.APP_URL || 'https://presenca.vercel.app'}/confirmar/${qrCode}`
        
        await sendNotification({
          tipo: 'convite',
          eventoNome: evento?.nome || 'Evento',
          participanteNome: nome,
          telefone: telefone,
          link: link,
        })
      }

      return response.status(201).json(participante)
    } catch (error) {
      console.error('Error:', error)
      return response.status(500).json({ error: 'Internal error' })
    }
  }

  return response.status(405).json({ error: 'Method not allowed' })
}