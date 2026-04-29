import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, QrCode, Calendar, MapPin, Clock, Download } from 'lucide-react'
import { Button, Card } from '../components/ui'
import { QRCodeGenerator } from '../components/qr'
import { useEventoStore, useParticipanteStore, type Participante } from '../stores'
import { formatDate } from '../lib/utils'

export function ParticipantePage() {
  const { qrCode } = useParams<{ qrCode: string }>()
  const navigate = useNavigate()
  const { eventos } = useEventoStore()
  const { participantes, updateParticipante } = useParticipanteStore()
  const [participante, setParticipante] = useState<Participante | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!qrCode) { navigate('/'); return }
    setTimeout(() => {
      const found = participantes.find((p) => p.qrCode === qrCode || p.id === qrCode)
      setParticipante(found || null)
      setLoading(false)
    }, 200)
  }, [qrCode, participantes, navigate])

  const evento = participante ? eventos.find((e) => e.id === participante.eventoId) : null

  const handleConfirmar = () => {
    if (!participante) return
    updateParticipante(participante.id, { confirmado: true, confirmadoEm: new Date().toISOString() })
    setParticipante({ ...participante, confirmado: true, confirmadoEm: new Date().toISOString() })
    fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'confirm', participanteNome: participante.nome, eventNome: evento?.nome }) }).catch(() => {})
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>

  if (!participante) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="text-center"><p className="text-gray-600">Link inválido ou expirado</p><Button onClick={() => navigate('/')} className="mt-4">Voltar</Button></Card>
    </div>
  )

  const qrValue = JSON.stringify({ t: 'P', e: participante.eventoId, p: participante.qrCode })

  return (
    <div className="min-h-screen bg-gray-50">
      {participante.confirmado ? (
        <div className="p-4 space-y-4">
          <Card className="bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div><h2 className="font-semibold text-green-800">Confirmado!</h2><p className="text-sm text-green-600">Sua presença foi confirmada</p></div>
            </div>
          </Card>
          <Card className="text-center">
            <h3 className="font-semibold text-gray-900 mb-4">Seu QR Code</h3>
            <div className="flex justify-center"><QRCodeGenerator value={qrValue} size={250} level="H" /></div>
            <p className="text-sm text-gray-500 mt-4">Mostre este QR Code na entrada do evento</p>
          </Card>
          {evento && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Detalhes do Evento</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-800">{evento.nome}</p>
                <div className="flex items-center gap-2 text-gray-600"><Calendar className="w-4 h-4" /><span>{formatDate(evento.data)}</span></div>
                <div className="flex items-center gap-2 text-gray-600"><Clock className="w-4 h-4" /><span>{evento.horario}</span></div>
                <div className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4" /><span>{evento.local}</span></div>
              </div>
            </Card>
          )}
          <Card padding="sm"><div className="text-center text-sm text-gray-500"><p>{participante.nome} • {participante.email}</p></div></Card>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <Card className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><QrCode className="w-8 h-8 text-blue-600" /></div>
            <h2 className="text-xl font-bold mb-2">{evento?.nome || 'Evento'}</h2>
            {evento && <div className="text-sm text-gray-600 mb-6"><p>{formatDate(evento.data)} às {evento.horario}</p><p>{evento.local}</p></div>}
            <p className="text-gray-500 mb-4">Confirme sua presença</p>
            <Button onClick={handleConfirmar} className="w-full" size="lg">Confirmar Presença</Button>
          </Card>
          <Card padding="sm"><div className="text-center text-sm text-gray-500"><p>{participante.nome}</p><p>{participante.email}</p></div></Card>
        </div>
      )}
    </div>
  )
}