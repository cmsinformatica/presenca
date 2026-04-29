import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, QrCode, LogOut, Calendar, MapPin, Clock, Users } from 'lucide-react'
import { Button, Card, Badge } from '../components/ui'
import { useAuthStore, useEventoStore, useParticipanteStore, type Evento } from '../stores'
import { formatDate } from '../lib/utils'

export function DashboardPage() {
  const navigate = useNavigate()
  const { organizador, logout } = useAuthStore()
  const { eventos } = useEventoStore()
  const { participantes } = useParticipanteStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Calcular stats reais para cada evento
  const getEventoStats = (eventoId: string) => {
    const eventoParts = participantes.filter((p) => p.eventoId === eventoId)
    return {
      total: eventoParts.length,
      confirmados: eventoParts.filter((p) => p.confirmado).length,
      compareceu: eventoParts.filter((p) => p.checkins && p.checkins.length > 0).length,
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-blue-600">Presença</h1>
            <p className="text-sm text-gray-500">Controle via QR Code</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 hidden sm:block">{organizador?.nome}</span>
            <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded" title="Sair">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="mb-4">
          <p className="text-gray-600">Olá, {organizador?.nome || 'Organizador'} 👋</p>
        </div>

        {/* Resumo geral */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="text-center">
            <div className="text-2xl font-bold text-gray-900">{eventos.length}</div>
            <div className="text-xs text-gray-500">Eventos</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {participantes.filter((p) => p.confirmado).length}
            </div>
            <div className="text-xs text-gray-500">Confirmados</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">{participantes.length}</div>
            <div className="text-xs text-gray-500">Participantes</div>
          </Card>
        </div>

        {/* Ações rápidas */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link to="/evento/novo">
            <Card className="h-full flex items-center justify-center py-8 border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <div className="text-center">
                <Plus className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <span className="text-gray-700 font-medium">Criar Evento</span>
              </div>
            </Card>
          </Link>
          <Link to="/portaria">
            <Card className="h-full flex items-center justify-center py-8 hover:bg-gray-50 transition-colors">
              <div className="text-center">
                <QrCode className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <span className="text-gray-700 font-medium">Portaria</span>
              </div>
            </Card>
          </Link>
        </div>

        {/* Lista de eventos */}
        <h2 className="text-lg font-semibold mb-3">Meus Eventos</h2>
        <div className="space-y-3">
          {eventos.map((evento) => {
            const stats = getEventoStats(evento.id)
            return <EventCard key={evento.id} evento={evento} stats={stats} />
          })}
          {eventos.length === 0 && (
            <Card className="py-12 text-center">
              <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 mb-1">Nenhum evento criado</p>
              <p className="text-sm text-gray-400 mb-4">Crie seu primeiro evento para começar</p>
              <Link to="/evento/novo">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
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

function EventCard({
  evento,
  stats,
}: {
  evento: Evento
  stats: { total: number; confirmados: number; compareceu: number }
}) {
  const navigate = useNavigate()

  return (
    <Card
      onClick={() => navigate(`/evento/${evento.id}`)}
      className="hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{evento.nome}</h3>
        <div className="flex gap-1">
          {stats.total > 0 && (
            <Badge variant={stats.confirmados >= stats.total * 0.8 ? 'success' : 'warning'}>
              {stats.confirmados}/{stats.total}
            </Badge>
          )}
        </div>
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
        {stats.total > 0 && (
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {stats.total} participantes
          </span>
        )}
      </div>
    </Card>
  )
}