import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Camera, CheckCircle, XCircle, AlertTriangle, ArrowLeft, Users } from 'lucide-react'
import { Card, Button, Badge } from '../components/ui'
import { QRReader } from '../components/qr'
import { useParticipanteStore, useEventoStore, type Participante } from '../stores'
import { formatDateTime } from '../lib/utils'

export function PortariaPage() {
  const { eventoId } = useParams<{ eventoId?: string }>()
  const navigate = useNavigate()
  const { participantes, updateParticipante } = useParticipanteStore()
  const { eventos } = useEventoStore()
  const [scanning, setScanning] = useState(false)
  const [lastResult, setLastResult] = useState<{
    type: 'success' | 'error' | 'warning'
    message: string
    participante?: Participante
  } | null>(null)
  const [checkinHistory, setCheckinHistory] = useState<
    { nome: string; timestamp: string; type: 'success' | 'error' | 'warning' }[]
  >([])

  const evento = eventoId ? eventos.find((e) => e.id === eventoId) : null
  const eventoParticipantes = eventoId
    ? participantes.filter((p) => p.eventoId === eventoId)
    : participantes

  const playSound = (type: 'success' | 'error') => {
    try {
      const ctx = new AudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      oscillator.frequency.value = type === 'success' ? 800 : 300
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3
      oscillator.start()
      oscillator.stop(ctx.currentTime + (type === 'success' ? 0.15 : 0.4))
    } catch {}
  }

  const vibrate = (type: 'success' | 'error') => {
    if (navigator.vibrate) {
      navigator.vibrate(type === 'success' ? [100, 50, 100] : [300, 100, 300])
    }
  }

  const handleScan = useCallback(
    (data: string) => {
      setScanning(false)

      let qrData: { t?: string; p?: string; e?: string }
      try {
        qrData = JSON.parse(data)
      } catch {
        qrData = { p: data }
      }

      // Buscar participante pelo qrCode
      const participante = eventoParticipantes.find(
        (p) => p.qrCode === qrData.p || p.id === qrData.p
      )

      if (!participante) {
        setLastResult({
          type: 'error',
          message: 'QR Code não encontrado',
        })
        setCheckinHistory((prev) => [
          { nome: 'Desconhecido', timestamp: new Date().toISOString(), type: 'error' },
          ...prev,
        ])
        playSound('error')
        vibrate('error')
        return
      }

      if (participante.checkins?.length) {
        setLastResult({
          type: 'warning',
          message: `Check-in já realizado às ${formatDateTime(participante.checkins[0].timestamp)}`,
          participante,
        })
        setCheckinHistory((prev) => [
          { nome: participante.nome, timestamp: new Date().toISOString(), type: 'warning' },
          ...prev,
        ])
        playSound('error')
        vibrate('error')
        return
      }

      const now = new Date().toISOString()
      updateParticipante(participante.id, {
        checkins: [
          {
            id: Date.now().toString(),
            participanteId: participante.id,
            eventoId: participante.eventoId,
            verificadoPor: 'portaria',
            timestamp: now,
          },
        ],
      })

      setLastResult({
        type: 'success',
        message: 'Check-in realizado!',
        participante: {
          ...participante,
          checkins: [
            {
              id: '1',
              participanteId: participante.id,
              eventoId: participante.eventoId,
              verificadoPor: 'portaria',
              timestamp: now,
            },
          ],
        },
      })
      setCheckinHistory((prev) => [
        { nome: participante.nome, timestamp: now, type: 'success' },
        ...prev,
      ])
      playSound('success')
      vibrate('success')

      // Notificar API
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checkin',
          participanteNome: participante.nome,
          eventNome: evento?.nome || '',
        }),
      }).catch(() => {})
    },
    [eventoParticipantes, updateParticipante, evento]
  )

  const handleManual = () => {
    const code = prompt('Digite o código do participante:')
    if (code) handleScan(code)
  }

  const handleNextScan = () => {
    setLastResult(null)
    setScanning(true)
  }

  const totalCheckins = eventoParticipantes.filter((p) => p.checkins?.length).length

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-1 hover:bg-gray-800 rounded">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Portaria</h1>
              {evento && <p className="text-sm text-gray-400">{evento.nome}</p>}
            </div>
          </div>
          <Badge variant="info">
            {totalCheckins}/{eventoParticipantes.length} check-ins
          </Badge>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {/* Scanner Area */}
        {scanning ? (
          <Card className="bg-black border-gray-700 overflow-hidden">
            <QRReader onResult={handleScan} onError={(err) => console.error(err)} />
            <Button
              variant="danger"
              onClick={() => setScanning(false)}
              className="w-full mt-3"
            >
              Parar Scanner
            </Button>
          </Card>
        ) : !lastResult ? (
          <Card className="bg-gray-800 border-gray-700">
            <div className="text-center py-8">
              <Camera className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h2 className="text-xl font-semibold mb-2">Escanear QR Code</h2>
              <p className="text-gray-400 mb-6">
                Aponte a câmera para o QR Code do participante
              </p>
              <Button
                onClick={() => setScanning(true)}
                className="w-full"
                size="lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                Iniciar Scanner
              </Button>
              <Button
                variant="ghost"
                onClick={handleManual}
                className="w-full mt-2 text-gray-400"
              >
                Entrada manual
              </Button>
            </div>
          </Card>
        ) : null}

        {/* Resultado */}
        {lastResult && (
          <Card
            className={`${
              lastResult.type === 'success'
                ? 'bg-green-900/80 border-green-600'
                : lastResult.type === 'warning'
                ? 'bg-yellow-900/80 border-yellow-600'
                : 'bg-red-900/80 border-red-600'
            } border-2`}
          >
            <div className="text-center py-6">
              {lastResult.type === 'success' && (
                <CheckCircle className="w-20 h-20 mx-auto mb-3 text-green-400" />
              )}
              {lastResult.type === 'warning' && (
                <AlertTriangle className="w-20 h-20 mx-auto mb-3 text-yellow-400" />
              )}
              {lastResult.type === 'error' && (
                <XCircle className="w-20 h-20 mx-auto mb-3 text-red-400" />
              )}
              <h3 className="text-2xl font-bold mb-1">{lastResult.message}</h3>
              {lastResult.participante && (
                <>
                  <p className="text-lg font-medium mt-3">{lastResult.participante.nome}</p>
                  <p className="text-sm text-gray-300">{lastResult.participante.email}</p>
                  {lastResult.participante.checkins?.length && (
                    <p className="text-sm text-gray-400 mt-2">
                      {formatDateTime(lastResult.participante.checkins[0].timestamp)}
                    </p>
                  )}
                </>
              )}
              <Button
                onClick={handleNextScan}
                className="mt-6 w-full"
                size="lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                Próximo
              </Button>
            </div>
          </Card>
        )}

        {/* Histórico de check-ins */}
        {checkinHistory.length > 0 && (
          <Card className="mt-4 bg-gray-800 border-gray-700" padding="none">
            <div className="p-3 border-b border-gray-700 text-sm font-semibold text-gray-400">
              Últimos Check-ins
            </div>
            <div className="divide-y divide-gray-700 max-h-48 overflow-auto">
              {checkinHistory.slice(0, 10).map((h, i) => (
                <div key={i} className="px-3 py-2 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {h.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : h.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    {h.nome}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(h.timestamp).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}