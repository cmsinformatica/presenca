import { VercelRequest, VercelResponse } from '@vercel/node'

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

  // Validar QR Code
  try {
    const qrData = JSON.parse(qrCode)

    if (qrData.t !== 'P') {
      return response.status(400).json({ error: 'QR Code inválido', type: 'invalid' })
    }

    // Em produção, verificar no banco de dados
    const checkin = {
      id: generateId(),
      participanteId: qrData.p,
      eventoId: qrData.e || eventoId,
      verificadoPor: verificadoPor || 'portaria',
      timestamp: new Date().toISOString(),
    }

    // Notificar via Telegram
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `✅ *Check-in realizado*\n\n🎫 ID: \`${qrData.p}\`\n⏰ ${new Date().toLocaleString('pt-BR')}`,
          parse_mode: 'Markdown',
        }),
      }).catch(() => {})
    }

    return response.status(200).json({ success: true, checkin })
  } catch {
    return response.status(400).json({ error: 'QR Code inválido', type: 'invalid' })
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
