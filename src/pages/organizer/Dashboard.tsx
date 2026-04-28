import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, MapPin, Users, ArrowRight } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import type { Evento } from '../../types'

const mockEventos: Evento[] = [
  {
    id: '1',
    nome: 'Workshop de React',
    descricao: 'Workshop prático sobre React e TypeScript',
    data: '2026-05-15',
    horario: '14:00',
    local: 'Auditório Principal',
    organizadorId: '1',
    criadoEm: '2026-04-01',
    atualizadoEm: '2026-04-01',
  },
  {
    id: '2',
    nome: 'Palestra UX Design',
    descricao: 'Introdução a UX Design',
    data: '2026-05-20',
    horario: '10:00',
    local: 'Sala de Conferncias A',
    organizadorId: '1',
    criadoEm: '2026-04-05',
    atualizadoEm: '2026-04-05',
  },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [eventos, setEventos] = useState<Evento[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('eventos')
    if (stored) {
      setEventos(JSON.parse(stored))
    } else {
      setEventos(mockEventos)
      localStorage.setItem('eventos', JSON.stringify(mockEventos))
    }
  }, [])

  const handleNovaEntrada = () => {
    const novo: Evento = {
      id: String(Date.now()),
      nome: 'Novo Evento',
      descricao: '',
      data: new Date().toISOString().split('T')[0],
      horario: '09:00',
      local: '',
      organizadorId: '1',
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    }
    const novos = [...eventos, novo]
    setEventos(novos)
    localStorage.setItem('eventos', JSON.stringify(novos))
    navigate(`/event/${novo.id}`)
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Meus Eventos</h1>
          <Button onClick={handleNovaEntrada} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Novo
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-3">
        {eventos.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum evento encontrado</p>
            <Button onClick={handleNovaEntrada} className="mt-4">
              Criar primeiro evento
            </Button>
          </div>
        ) : (
          eventos.map((evento) => (
            <Card
              key={evento.id}
              onClick={() => navigate(`/event/${evento.id}`)}
              className="flex items-center justify-between"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{evento.nome}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(evento.data)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {evento.local}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Card>
          ))
        )}
      </main>
    </div>
  )
}