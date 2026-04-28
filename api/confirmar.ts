import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'
import { sendNotification } from './notifications'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { qrCode, telefone } = request.body

  if (!qrCode) {
    return response.status(400).json({ error: 'qrCode required' })
  }

  try {
    const participante = await prisma.participante.findUnique({
      where: { qrCode },
      include: { evento: true },
    })

    if (!participante) {
      return response.status(404).json({ error: 'Participante não encontrado' })
    }

    if (participante.confirmado) {
      return response.status(400).json({ error: 'Já confirmado' })
    }

    const atualizado = await prisma.participante.update({
      where: { qrCode },
      data: {
        confirmado: true,
        confirmadoEm: new Date(),
        telefone: telefone || participante.telefone,
      },
    })

    await sendNotification({
      tipo: 'confirmacao',
      eventoNome: participante.evento.nome,
      participanteNome: participante.nome,
      telefone: telefone || participante.telefone,
    })

    const qrCheckIn = JSON.stringify({
      t: 'P',
      e: participante.eventoId,
      p: qrCode,
    })

    return response.status(200).json({
      success: true,
      participante: atualizado,
      qrCode: qrCheckIn,
    })
  } catch (error) {
    console.error('Error:', error)
    return response.status(500).json({ error: 'Internal error' })
  }
}