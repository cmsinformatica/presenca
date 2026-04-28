import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'

const ADMIN_EMAIL = 'admin@presenca.com'
const ADMIN_SENHA = 'admin123'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method === 'POST') {
    const { email, senha } = request.body

    if (!email || !senha) {
      return response.status(400).json({ error: 'Email e senha obrigatórios' })
    }

    try {
      // Login admin fixo
      if (email === ADMIN_EMAIL && senha === ADMIN_SENHA) {
        let admin = await prisma.organizador.findUnique({ where: { email: ADMIN_EMAIL } })
        
        if (!admin) {
          admin = await prisma.organizador.create({
            data: { 
              email: ADMIN_EMAIL, 
              nome: 'Administrador' 
            },
          })
        }

        const token = Buffer.from(`admin:${admin.id}:${Date.now()}`).toString('base64')

        return response.status(200).json({
          token,
          organizador: admin,
        })
      }

      // Login normal - buscar no banco
      let organizador = await prisma.organizador.findUnique({ where: { email } })

      if (!organizador) {
        return response.status(401).json({ error: 'Usuário não encontrado' })
      }

      const token = Buffer.from(`${organizador.id}:${Date.now()}`).toString('base64')

      return response.status(200).json({
        token,
        organizador,
      })
    } catch (error) {
      console.error('Error:', error)
      return response.status(500).json({ error: 'Internal error' })
    }
  }

  return response.status(405).json({ error: 'Method not allowed' })
}