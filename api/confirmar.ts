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

  const { codigo, telefone, nome, email } = request.body

  if (!codigo) {
    return response.status(400).json({ error: 'Código obrigatório' })
  }

  try {
    // Decodificar o código base64
    const decoded = Buffer.from(codigo, 'base64').toString('utf-8')
    const parts = decoded.split(':')

    if (parts.length < 3) {
      return response.status(400).json({ error: 'Link inválido ou expirado' })
    }

    const [tipo, eventoNome, participanteNome, participanteEmail] = parts

    // Gerar QR Code para o participante
    const qrData = JSON.stringify({
      t: 'P',
      e: Buffer.from(eventoNome || '').toString('base64'),
      p: codigo,
    })

    const confirmacao = {
      nome: participanteNome || nome,
      email: participanteEmail || email,
      telefone: telefone || '',
      confirmado: true,
      confirmadoEm: new Date().toISOString(),
      qrCode: qrData,
    }

    // Notificar via Telegram
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const msg = `✅ *Confirmação de Presença*\n\n👤 ${confirmacao.nome}\n📧 ${confirmacao.email}\n📱 ${confirmacao.telefone}\n📅 Evento: ${eventoNome}`
      
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: msg,
          parse_mode: 'Markdown',
        }),
      }).catch(() => {})
    }

    return response.status(200).json(confirmacao)
  } catch {
    return response.status(400).json({ error: 'Erro ao processar confirmação' })
  }
}
