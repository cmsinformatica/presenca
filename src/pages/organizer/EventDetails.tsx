import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Clock, Users, QrCode, Download, Mail, CheckCircle, XCircle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import type { Evento, Participante } from '../../types'

const mockParticipantes: Participante[] = [
  { id: 'p1', nome: 'João Silva', email: 'joao@email.com', eventoId: '1', qrCode: 'qr_joao_1', confirmado: true, confirmadoEm: '2026-04-10T10:00:00Z', criadoEm: '2026-04-01' },
  { id: 'p2', nome: 'Maria Santos', email: 'maria@email.com', eventoId: '1', qrCode: 'qr_maria_1', confirmado: true, confirmadoEm: '2026-04-11T14:00:00Z', criadoEm: '2026-04-02' },
  { id: 'p3', nome: 'Pedro Costa', email: 'pedro@email.com', eventoId: '1', qrCode: 'qr_pedro_1', confirmado: false, criadoEm: '2026-04-03' },
]

export default function EventDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [evento, setEvento] = useState<Evento | null>(null)
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [showQR, setShowQR] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novoEmail, setNovoEmail] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('eventos')
    if (stored) {
      const eventos = JSON.parse(stored) as Evento[]
      const ev = eventos.find(e => e.id === id)
      if (ev) setEvento(ev)
    }
    
    const storedP = localStorage.getItem('participantes')
    if (storedP) {
      const parts = JSON.parse(storedP) as Participante[]
      setParticipantes(parts.filter(p => p.eventoId === id))
    } else {
      setParticipantes(mockParticipantes.filter(p => p.eventoId === id))
      localStorage.setItem('participantes', JSON.stringify(mockParticipantes))
    }
  }, [id])

  const handleAddParticipante = () => {
    if (!novoNome || !novoEmail) return
    
    const novo: Participante = {
      id: 'p' + Date.now(),
      nome: novoNome,
      email: novoEmail,
      eventoId: id!,
      qrCode: `qr_${novoEmail.split('@')[0]}_${id}`,
      confirmado: false,
      criadoEm: new Date().toISOString(),
    }
    
    const novos = [...participantes, novo]
    setParticipantes(novos)
    
    const stored = localStorage.getItem('participantes')
    const allParts = stored ? JSON.parse(stored) : mockParticipantes
    localStorage.setItem('participantes', JSON.stringify([...allParts, novo]))
    
    setNovoNome('')
    setNovoEmail('')
  }

  const handleCheckinLink = () => {
    const url = `${window.location.origin}/checkin/${id}`
    setShowQR(!showQR)
  }

  const handleExport = () => {
    const csv = [
      ['Nome', 'Email', 'Confirmado', 'Data Confirmação'].join(','),
      ...participantes.map(p => [
        p.nome,
        p.email,
        p.confirmado ? 'Sim' : 'Não',
        p.confirmadoEm || ''
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${evento?.nome || 'evento'}.csv`
    a.click()
  }

  const confirmados = participantes.filter(p => p.confirmado).length
  const total = participantes.length

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  if (!evento) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Evento não encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1 truncate">{evento.nome}</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <Card>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(evento.data)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{evento.horario}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{evento.local}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{confirmados}</div>
              <div className="text-xs text-gray-600">Confirmados</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleCheckinLink} variant="outline">
            <QrCode className="w-4 h-4 mr-2" />
            QR Portaria
          </Button>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>

        {showQR && (
          <Card className="text-center">
            <p className="text-sm text-gray-500 mb-3">Escaneie para fazer check-in</p>
            <div className="inline-block p-4 bg-white rounded-lg">
              <QRCodeSVG value={`${window.location.origin}/checkin/${id}`} size={180} />
            </div>
          </Card>
        )}

        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Adicionar Participante</h3>
          <div className="space-y-2">
            <Input
              placeholder="Nome"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Email"
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
            />
            <Button onClick={handleAddParticipante} className="w-full">
              <Users className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Participantes ({participantes.length})</h3>
          <div className="space-y-2">
            {participantes.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="font-medium text-gray-900">{p.nome}</div>
                  <div className="text-sm text-gray-500">{p.email}</div>
                </div>
                {p.confirmado ? (
                  <Badge variant="success">Confirmado</Badge>
                ) : (
                  <Badge variant="neutral">Pendente</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  )
}