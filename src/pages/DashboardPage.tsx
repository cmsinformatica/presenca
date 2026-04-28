import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, QrCode, LogOut, Calendar, MapPin, Clock, AlertCircle } from 'lucide-react'
import { Button, Card, Badge } from '../components/ui'
import { useAuthStore, useEventoStore, type Evento } from '../stores'
import { formatDate } from '../lib/utils'

export function DashboardPage() {
  const navigate = useNavigate()
  const { organizador, logout } = useAuthStore()
  const { eventos, setEventos, loading, setLoading, error, setError } = useEventoStore()
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (eventos.length > 0) {
      setLoading(false)
      return
    }

    setLoadError(null)
    setLoading(true)

    const timer = setTimeout(() => {
      try {
        setEventos([
          {
            id: '1',
            nome: 'Workshop React',
            descricao: 'Workshop de React Avançado',
            data: '2026-05-15',
            horario: '14:00',
            local: 'Auditório Principal',
            organizadorId: '1',
            stats: { total: 50, confirmados: 38, compareceu: 32 },
          },
          {
            id: '2',
            nome: 'Palestra UX',
            descricao: 'Palestra de UX Design',
            data: '2026-05-20',
            horario: '10:00',
            local: 'Sala 101',
            organizadorId: '1',
            stats: { total: 30, confirmados: 25, compareceu: 20 },
          },
        ])
        setLoading(false)
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Erro ao carregar eventos')
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [eventos.length, setEventos, setLoading])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleRetry = () => {
    setLoadError(null)
    setEventos([])
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{loadError}</p>
          <Button onClick={handleRetry}>Tentar novamente</Button>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Meus Eventos</h1>
          <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded">
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="mb-4">
          <p className="text-gray-600">Olá, {organizador?.nome || 'Organizador'}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Link to="/evento/novo">
            <Card className="h-full flex items-center justify-center py-8 border-dashed">
              <div className="text-center">
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-gray-600">Criar Evento</span>
              </div>
            </Card>
          </Link>
          <Link to="/portaria">
            <Card className="h-full flex items-center justify-center py-8">
              <div className="text-center">
                <QrCode className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <span className="text-gray-600">Portaria</span>
              </div>
            </Card>
          </Link>
        </div>

        <h2 className="text-lg font-semibold mb-3">Eventos</h2>
        <div className="space-y-3">
          {eventos.map((evento) => (
            <EventCard key={evento.id} evento={evento} />
          ))}
          {eventos.length === 0 && (
            <Card className="py-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Nenhum evento encontrado</p>
              <Link to="/evento/novo">
                <Button variant="outline" className="mt-3">
                  Criar primeiro evento
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

function EventCard({ evento }: { evento: Evento }) {
  const navigate = useNavigate()
  const stats = evento.stats

  return (
    <Card
      onClick={() => navigate(`/evento/${evento.id}`)}
      className="hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{evento.nome}</h3>
        {stats && (
          <Badge variant={stats.confirmados >= stats.total * 0.8 ? 'success' : 'warning'}>
            {stats.confirmados}/{stats.total}
          </Badge>
        )}
      </div>
      {evento.descricao && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-1">{evento.descricao}</p>
      )}
      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {formatDate(evento.data)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {evento.horario}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {evento.local}
        </span>
      </div>
    </Card>
  )
}