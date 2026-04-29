import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './lib/prisma'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  if (request.method === 'OPTIONS') {
    return response.status(200).end()
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { qrCode, eventoId, verificadoPor } = request.body

  if (!qrCode) {
    return response.status(400).json({ error: 'QR Code obrigatório' })
  }

  try {
    const qrData = JSON.parse(qrCode)

    if (qrData.t !== 'P') {
      return response.status(400).json({ error: 'QR Code inválido', type: 'invalid' })
    }

    // Buscar participante no BD pelo código qrcode (que vem em qrData.p se for link antigo, ou qrCode literal se for do app)
    const participanteStr = qrData.p || qrCode
    const participante = await prisma.participante.findFirst({
      where: {
        OR: [
          { qrCode: participanteStr },
          { id: participanteStr }
        ]
      },
      include: { checkins: true }
    })

    if (!participante) {
      return response.status(400).json({ error: 'Participante não encontrado', type: 'invalid' })
    }

    if (participante.checkins.length > 0) {
      return response.status(400).json({ error: 'Check-in já realizado', type: 'duplicate', participante })
    }

    // Gravar no BD
    const checkin = await prisma.checkIn.create({
      data: {
        participanteId: participante.id,
        eventoId: qrData.e ? Buffer.from(qrData.e, 'base64').toString('utf-8') : (eventoId || participante.eventoId),
        verificadoPor: verificadoPor || 'portaria'
      }
    })

    // Notificar via Telegram
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `✅ *Check-in realizado*\n\n👤 ${participante.nome}\n🎫 ID: \`${participante.id}\`\n⏰ ${new Date().toLocaleString('pt-BR')}`,
          parse_mode: 'Markdown',
        }),
      }).catch(() => {})
    }

    return response.status(200).json({ success: true, checkin, participante })
  } catch (error: any) {
    console.error('Checkin Error:', error)
    return response.status(400).json({ error: 'QR Code inválido ou erro no servidor', type: 'invalid' })
  }
}
