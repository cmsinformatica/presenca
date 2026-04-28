import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, QrCode, Calendar, MapPin, Clock, Share, Download } from 'lucide-react'
import { Button, Card, Badge } from '../components/ui'
import { QRCodeGenerator } from '../components/qr'
import { useEventoStore, useParticipanteStore, type Participante, type Evento } from '../stores'
import { formatDate, formatTime } from '../lib/utils'

export function ParticipantePage() {
  const { qrCode } = useParams<{ qrCode: string }>()
  const navigate = useNavigate()
  const { eventoAtual, setEventoAtual } = useEventoStore()
  const { participantes, setParticipantes, updateParticipante } = useParticipanteStore()
  const [participante, setParticipante] = useState<Participante | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!qrCode) {
      navigate('/')
      return
    }

    setTimeout(() => {
      setEventoAtual({
        id: '1',
        nome: 'Workshop React',
        descricao: 'Workshop de React Avançado',
        data: '2026-05-15',
        horario: '14:00',
        local: 'Auditório Principal',
        organizadorId: '1',
      })

      const mockParticipante: Participante = {
        id: 'p1',
        nome: 'João Silva',
        email: 'joao@email.com',
        telefone: '(11) 99999-9999',
        eventoId: '1',
        qrCode: qrCode,
        confirmado: true,
        confirmadoEm: '2026-05-10T10:00:00Z',
      }

      setParticipante(mockParticipante)
      setLoading(false)
    }, 300)
  }, [qrCode, setEventoAtual])

  const handleConfirmar = () => {
    if (!participante) return

    updateParticipante(participante.id, {
      confirmado: true,
      confirmadoEm: new Date().toISOString(),
    })
    setParticipante({ ...participante, confirmado: true, confirmadoEm: new Date().toISOString() })
  }

  const handleSaveImage = () => {
    const canvas = document.querySelector('#qr-code-generator canvas') as HTMLCanvasElement
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `qrcode-${participante?.nome || 'participante'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!participante) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="text-center">
          <p className="text-gray-600">Link inválido ou expirado</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Voltar
          </Button>
        </Card>
      </div>
    )
  }

  const qrValue = JSON.stringify({
    t: 'P',
    e: participante.eventoId,
    p: participante.qrCode,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {participante.confirmado ? (
        <div className="p-4 space-y-4">
          <Card className="bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h2 className="font-semibold text-green-800">Confirmado!</h2>
                <p className="text-sm text-green-600">Sua presença foi confirmada</p>
              </div>
            </div>
          </Card>

          <Card className="text-center">
            <h3 className="font-semibold text-gray-900 mb-4">Seu QR Code</h3>
            <div className="flex justify-center">
              <QRCodeGenerator value={qrValue} size={250} />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Mostre este QR Code na entrada do evento
            </p>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={handleSaveImage}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Salvar
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  navigator.share?.({
                    title: 'Meu QR Code',
                    text: qrValue,
                  })
                }}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Share className="w-4 h-4" />
                Compartilhar
              </Button>
            </div>
          </Card>

          {eventoAtual && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Detalhes do Evento</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(eventoAtual.data)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{eventoAtual.horario}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{eventoAtual.local}</span>
                </div>
              </div>
            </Card>
          )}

          <Card padding="sm">
            <div className="text-center text-sm text-gray-500">
              <p>Participante: {participante.nome}</p>
              <p>{participante.email}</p>
            </div>
          </Card>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <Card className="text-center">
            <h2 className="text-xl font-bold mb-2">{eventoAtual?.nome}</h2>
            {eventoAtual?.descricao && (
              <p className="text-gray-500 mb-4">{eventoAtual.descricao}</p>
            )}

            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p>{formatDate(eventoAtual?.data || '')} às {eventoAtual?.horario}</p>
              <p>{eventoAtual?.local}</p>
            </div>

            <p className="text-gray-500 mb-4">
              Você foi convidado para este evento. Confirme sua presença abaixo.
            </p>

            <Button onClick={handleConfirmar} className="w-full" size="lg">
              Confirmar Presença
            </Button>
          </Card>

          <Card padding="sm">
            <div className="text-center text-sm text-gray-500">
              <p>Nome: {participante.nome}</p>
              <p>Email: {participante.email}</p>
              {participante.telefone && <p>Tel: {participante.telefone}</p>}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}