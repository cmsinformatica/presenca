import { VercelRequest, VercelResponse } from '@vercel/node'

const ADMIN_EMAIL = 'admin@presenca.com'
const ADMIN_SENHA = 'admin123'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method === 'POST') {
    const { email, senha } = request.body

    if (!email || !senha) {
      return response.status(400).json({ error: 'Email e senha obrigatórios' })
    }

    // Login admin fixo
    if (email === ADMIN_EMAIL && senha === ADMIN_SENHA) {
      return response.status(200).json({
        token: 'admin-token-' + Date.now(),
        organizador: {
          id: 'admin-1',
          email: ADMIN_EMAIL,
          nome: 'Administrador',
        },
      })
    }

    // Demo login
    if (email === 'demo@demo.com' && senha === 'demo') {
      return response.status(200).json({
        token: 'demo-token-' + Date.now(),
        organizador: {
          id: 'demo-1',
          email: 'demo@demo.com',
          nome: 'Demo',
        },
      })
    }

    // Qualquer outro cria automaticamente
    return response.status(200).json({
      token: 'user-' + Date.now(),
      organizador: {
        id: 'user-' + Date.now(),
        email: email,
        nome: email.split('@')[0],
      },
    })
  }

  return response.status(405).json({ error: 'Method not allowed' })
}