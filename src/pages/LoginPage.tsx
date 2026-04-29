import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Card } from '../components/ui'
import { useAuthStore } from '../stores'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const normalizedEmail = email.trim().toLowerCase()
      if (
        (normalizedEmail === 'demo@demo.com' && password === 'demo') ||
        (normalizedEmail === 'admin@presenca.com' && password === 'admin')
      ) {
        login(
          { id: '1', email: normalizedEmail, nome: normalizedEmail === 'admin@presenca.com' ? 'Administrador' : 'Demo' },
          'demo-token'
        )
        navigate('/dashboard')
      } else {
        setError('Email ou senha inválidos')
      }
    } catch {
      setError('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Presença</h1>
          <p className="text-gray-500 mt-1">Controle de presença via QR Code</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            Entrar
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Acesso liberado para:<br/>
          demo@demo.com / demo<br/>
          admin@presenca.com / admin
        </p>
      </Card>
    </div>
  )
}