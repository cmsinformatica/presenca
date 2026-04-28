import { VercelRequest, VercelResponse } from '@vercel/node'

interface NotifyParams {
  tipo: 'confirmacao' | 'convite' | 'checkin'
  eventoNome: string
  participanteNome: string
  telefone?: string
  link?: string
}

export async function sendNotification(params: NotifyParams) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram not configured')
    return
  }

  const { tipo, eventoNome, participanteNome, telefone, link } = params

  const emojis = { confirmacao: '✅', convite: '📨', checkin: '🎫' }
  const emoji = emojis[tipo]

  let message = `${emoji} *Nova Atualização*\n\n`
  message += `👤 Participante: *${participanteNome}*\n`
  message += `📅 Evento: *${eventoNome}*\n`

  if (telefone) {
    message += `📱 WhatsApp: ${telefone}\n`
  }

  if (tipo === 'confirmacao') {
    message += `\n✨ Confirmação de presença`
  } else if (tipo === 'checkin') {
    message += `\n✨ Check-in realizado`
  }

  if (link) {
    message += `\n\n🔗 Link: ${link}`
  }

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    })
  } catch (error) {
    console.error('Telegram error:', error)
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const { TEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return response.status(500).json({ error: 'Configuração incompleta' })
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { eventNome, participanteNome, telefone, action } = request.body

  const emojis = { confirm: '✅', cancel: '❌', qrcode: '🎫' }
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

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    return response.status(200).json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return response.status(500).json({ error: 'Internal error' })
  }
}