import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Check, Calendar, MapPin, Clock, QrCode } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import type { Evento, Participante } from '../../types'

export default function Confirm() {
  const { qrCode } = useParams<{ qrCode: string }>()
  const navigate = useNavigate()
  const [participante, setParticipante] = useState<Participante | null>(null)
  const [evento, setEvento] = useState<Evento | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedP = localStorage.getItem('participantes')
    if (storedP) {
      const parts = JSON.parse(storedP) as Participante[]
      const p = parts.find(p => p.qrCode === qrCode)
      if (p) {
        setParticipante(p)
        
        const storedE = localStorage.getItem('eventos')
        if (storedE) {
          const eventos = JSON.parse(storedE) as Evento[]
          const ev = eventos.find(e => e.id === p.eventoId)
          if (ev) setEvento(ev)
        }
      }
    }
    setLoading(false)
  }, [qrCode])

  const handleConfirmar = () => {
    if (!participante) return
    
    const updated = { ...participante, confirmado: true, confirmadoEm: new Date().toISOString() }
    
    const stored = localStorage.getItem('participantes')
    if (stored) {
      const parts = JSON.parse(stored) as Participante[]
      const novos = parts.map(p => p.id === participante.id ? updated : p)
      localStorage.setItem('participantes', JSON.stringify(novos))
    }
    
    setParticipante(updated)
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  const handleVerQR = () => {
    if (qrCode) {
      navigate(`/qr/${qrCode}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!participante || !evento) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="text-center">
          <p className="text-gray-500">Link inválido ou expirado</p>
          <p className="text-sm text-gray-400 mt-2">Código: {qrCode}</p>
        </Card>
      </div>
    )
  }

  if (participante.confirmado) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-green-900 mb-2">Você está confirmado!</h1>
          <p className="text-green-700 mb-6">Aguardamos você no evento.</p>
          
          <Card className="text-left mb-4">
            <h2 className="font-semibold text-gray-900 mb-3">{evento.nome}</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(evento.data)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{evento.horario}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{evento.local}</span>
              </div>
            </div>
          </Card>
          
          <Button onClick={handleVerQR} className="w-full">
            <QrCode className="w-5 h-5 mr-2" />
            Ver QR Code
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Confirme sua Presença</h1>
          <p className="text-gray-500 mt-1">Você foi convidado para:</p>
        </div>

        <Card className="text-left mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">{evento.nome}</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(evento.data)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{evento.horario}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{evento.local}</span>
            </div>
          </div>
        </Card>

        <Card className="text-left">
          <p className="text-sm text-gray-600 mb-4">
            Olá <strong>{participante.nome}</strong>! Clique no botão abaixo para confirmar sua presença.
          </p>
          <Button onClick={handleConfirmar} className="w-full">
            <Check className="w-5 h-5 mr-2" />
            Confirmar Presença
          </Button>
        </Card>
      </div>
    </div>
  )
}