import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './lib/prisma'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  if (request.method === 'OPTIONS') {
    return response.status(200).end()
  }

  try {
    if (request.method === 'GET') {
      const { eventoId, qrCode, id } = request.query

      if (id) {
        const p = await prisma.participante.findUnique({
          where: { id: String(id) },
          include: { checkins: true }
        })
        if (!p) return response.status(404).json({ error: 'Participante não encontrado' })
        return response.status(200).json(p)
      }

      if (qrCode) {
        const found = await prisma.participante.findUnique({
          where: { qrCode: String(qrCode) },
          include: { checkins: true }
        })
        if (!found) return response.status(404).json({ error: 'QR Code não encontrado' })
        return response.status(200).json(found)
      }

      if (eventoId) {
        const filtered = await prisma.participante.findMany({
          where: { eventoId: String(eventoId) },
          include: { checkins: true }
        })
        return response.status(200).json(filtered)
      }

      const all = await prisma.participante.findMany({
        include: { checkins: true }
      })
      return response.status(200).json(all)
    }

    if (request.method === 'POST') {
      // O body pode ser um array de participantes (importação CSV) ou um único objeto
      const data = request.body

      if (Array.isArray(data)) {
        // Bulk create para CSV
        const qrCodes = data.map(() => generateId())
        const formattedData = data.map((item, index) => ({
          nome: item.nome,
          email: item.email,
          telefone: item.telefone || null,
          eventoId: item.eventoId,
          qrCode: qrCodes[index],
        }))
        
        const criados = await prisma.participante.createMany({
          data: formattedData,
          skipDuplicates: true // ignora se o email+eventoId ja existir
        })
        
        return response.status(201).json({ count: criados.count })
      } else {
        const { nome, email, telefone, eventoId } = data

        if (!nome || !email || !eventoId) {
          return response.status(400).json({ error: 'Campos obrigatórios: nome, email, eventoId' })
        }

        const participante = await prisma.participante.create({
          data: {
            nome,
            email,
            telefone: telefone || null,
            eventoId,
            qrCode: generateId()
          },
          include: { checkins: true }
        })

        return response.status(201).json(participante)
      }
    }

    if (request.method === 'PUT') {
      const { id } = request.query
      if (!id) return response.status(400).json({ error: 'ID obrigatório' })

      const updates = request.body
      const updated = await prisma.participante.update({
        where: { id: String(id) },
        data: updates,
        include: { checkins: true }
      })

      return response.status(200).json(updated)
    }

    if (request.method === 'DELETE') {
      const { id } = request.query
      if (!id) return response.status(400).json({ error: 'ID obrigatório' })

      await prisma.participante.delete({
        where: { id: String(id) }
      })
      return response.status(200).json({ success: true })
    }

    return response.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('API Error:', error)
    return response.status(500).json({ error: 'Erro no servidor', details: error.message })
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
