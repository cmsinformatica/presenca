import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'
import { sendNotification } from './notifications'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { qrCode } = request.body

  if (!qrCode) {
    return response.status(400).json({ error: 'qrCode required' })
  }

  try {
    let qrData: { t: string; e: string; p: string }

    try {
      qrData = JSON.parse(qrCode)
    } catch {
      qrData = { t: 'P', e: '', p: qrCode }
    }

    if (qrData.t !== 'P') {
      return response.status(400).json({ error: 'QR Code inválido' })
    }

    const participante = await prisma.participante.findUnique({
      where: { qrCode: qrData.p || qrCode },
      include: { evento: true },
    })

    if (!participante) {
      return response.status(404).json({ error: 'Participante não encontrado' })
    }

    const checkInExistente = await prisma.checkIn.findFirst({
      where: {
        participanteId: participante.id,
        eventoId: participante.eventoId,
      },
    })

    if (checkInExistente) {
      return response.status(400).json({
        error: 'Check-in já realizado',
        participante: {
          nome: participante.nome,
          email: participante.email,
          horario: checkInExistente.timestamp,
        },
      })
    }

    const checkIn = await prisma.checkIn.create({
      data: {
        participanteId: participante.id,
        eventoId: participante.eventoId,
        verificadoPor: 'portaria',
      },
    })

    await sendNotification({
      tipo: 'checkin',
      eventoNome: participante.evento.nome,
      participanteNome: participante.nome,
      telefone: participante.telefone || undefined,
    })

    return response.status(200).json({
      success: true,
      checkIn,
      participante: {
        nome: participante.nome,
        email: participante.email,
        telefone: participante.telefone,
        confirmadoEm: participante.confirmadoEm,
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return response.status(500).json({ error: 'Internal error' })
  }
}