import { VercelRequest, VercelResponse } from '@vercel/node'

interface TelegramMessage {
  message_id?: number
  from?: { id: number; first_name?: string; username?: string }
  chat?: { id: number }
  text?: string
}

interface Body {
  message?: TelegramMessage
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { TELEGRAM_BOT_TOKEN, WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, WHATSAPP_RECIPIENT } = process.env

  const body = request.body as Body
  const message = body.message

  if (!message?.text) {
    return response.status(400).json({ error: 'No message' })
  }

  const userMessage = message.text
  const userId = message.from?.id

  let replyMessage = ''

  if (userMessage.startsWith('/start')) {
    replyMessage = `👋 *Bem-vindo!*

Use:
• /qrcode - Ver QR Code
• /confirmar - Confirmar`
  } else if (userMessage.startsWith('/qrcode')) {
    replyMessage = '🎫 Acesse o link que recebeu por email para ver seu QR Code'
  } else if (userMessage.startsWith('/confirmar')) {
    replyMessage = '✅ Clique no link do email para confirmar'
  } else {
    const texto = ` Nova msg Telegram:\n${userMessage} `

    if (WHATSAPP_TOKEN && WHATSAPP_PHONE_ID && WHATSAPP_RECIPIENT) {
      await sendWhatsAppMessage(WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, WHATSAPP_RECIPIENT, texto)
    }

    replyMessage = '✅ Msg reenviada!'
  }

  if (TELEGRAM_BOT_TOKEN && userId) {
    await sendTelegramMessage(TELEGRAM_BOT_TOKEN, userId, replyMessage)
  }

  return response.status(200).json({ success: true })
}

async function sendTelegramMessage(token: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  })
}

async function sendWhatsAppMessage(token: string, phoneId: string, recipient: string, text: string) {
  await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'text',
      text: { body: text },
    }),
  })
}