import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'
import { sendNotification } from './notifications'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { eventoId, nome, telefone } = request.body

  if (!eventoId || !nome || !telefone) {
    return response.status(400).json({ error: 'Dados incompletos' })
  }

  try {
    // Buscar participante pelo nome e evento
    const participante = await prisma.participante.findFirst({
      where: {
        eventoId,
        nome: { contains: nome, mode: 'insensitive' },
      },
      include: { evento: true },
    })

    if (!participante) {
      return response.status(404).json({ error: 'Participante não encontrado' })
    }

    // Atualizar telefone e confirmar
    const atualizado = await prisma.participante.update({
      where: { id: participante.id },
      data: {
        telefone,
        confirmado: true,
        confirmadoEm: new Date(),
      },
    })

    // Gerar QR Code
    const qrCode = JSON.stringify({
      t: 'P',
      e: eventoId,
      p: participante.qrCode,
    })

    // Enviar notificação Telegram
    await sendNotification({
      tipo: 'confirmacao',
      eventoNome: participante.evento.nome,
      participanteNome: nome,
      telefone: telefone,
    })

    return response.status(200).json({
      success: true,
      participante: atualizado,
      qrCode,
    })
  } catch (error) {
    console.error('Error:', error)
    return response.status(500).json({ error: 'Internal error' })
  }
}