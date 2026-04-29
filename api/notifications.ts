import { VercelRequest, VercelResponse } from '@vercel/node'

interface Body {
  eventNome?: string
  participanteNome?: string
  telefone?: string
  action?: string
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return response.status(500).json({ error: 'Configuração incompleta' })
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { eventNome, participanteNome, telefone, action } = request.body as Body

  const emojis = {
    confirm: '✅',
    cancel: '❌',
    qrcode: '🎫',
  }

  const emoji = emojis[action as keyof typeof emojis] || '📋'
  
  let message = `${emoji} *Nova Atualização*\n\n`
  
  if (participanteNome) {
    message += `👤 Participante: *${participanteNome}*\n`
  }
  if (eventNome) {
    message += `📅 Evento: *${eventNome}*\n`
  }
  if (telefone) {
    message += `📱 WhatsApp: ${telefone}\n`
  }
  if (action) {
    const actions = {
      confirm: '✅ Confirmação de presença',
      qr: '🎫 QR Code gerado',
      checkin: '✅ Check-in realizado',
    }
    message += `\n✨ ${actions[action as keyof typeof actions] || action}`
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    )

    const data = await res.json()
    
    if (!data.ok) {
      console.error('Telegram API error:', data)
      return response.status(500).json({ error: 'Failed to send message' })
    }

    return response.status(200).json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return response.status(500).json({ error: 'Internal error' })
  }
}