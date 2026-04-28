import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, CheckCircle, XCircle, AlertTriangle, Volume2 } from 'lucide-react'
import { Card, Button } from '../components/ui'
import { useParticipanteStore, type Participante } from '../stores'
import { formatDateTime } from '../lib/utils'

export function PortariaPage() {
  const navigate = useNavigate()
  const { participantes, updateParticipante } = useParticipanteStore()
  const [scanning, setScanning] = useState(false)
  const [lastResult, setLastResult] = useState<{
    type: 'success' | 'error' | 'warning'
    message: string
    participante?: Participante
  } | null>(null)

  const playSound = (type: 'success' | 'error') => {
    const audio = new Audio(
      type === 'success'
        ? 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodLb8f7x'
        : 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodLb8f7x'
    )
    audio.play().catch(() => {})
  }

  const vibrate = (type: 'success' | 'error') => {
    if (navigator.vibrate) {
      navigator.vibrate(type === 'success' ? 200 : 500)
    }
  }

  const handleScan = useCallback(
    (data: string) => {
      setScanning(false)
      
      let qrData: { p?: string }
      try {
        qrData = JSON.parse(data)
      } catch {
        qrData = { p: data }
      }

      const participante = participantes.find(
        (p) => p.qrCode === qrData.p
      )

      if (!participante) {
        setLastResult({
          type: 'error',
          message: 'QR Code não encontrado',
        })
        playSound('error')
        vibrate('error')
        return
      }

      if (participante.checkins?.length) {
        setLastResult({
          type: 'warning',
          message: 'Check-in já realizado',
          participante,
        })
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
        participante: { ...participante, checkins: [{ id: '1', participanteId: participante.id, eventoId: participante.eventoId, verificadoPor: 'portaria', timestamp: now }] },
      })
      playSound('success')
      vibrate('success')
    },
    [participantes, updateParticipante]
  )

  const handleManual = () => {
    const code = prompt('Digite o código do participante:')
    if (code) handleScan(code)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Portaria</h1>
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-white">
            Voltar
          </Button>
        </div>
      </header>

      <main className="p-4">
        <Card className="bg-gray-800 border-gray-700">
          <div className="text-center py-8">
            <Camera className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <h2 className="text-xl font-semibold mb-2">Escanear QR Code</h2>
            <p className="text-gray-400 mb-6">
              Aponte a câmera para o QR Code do participante
            </p>
            <Button
              onClick={() => setScanning(!scanning)}
              className="w-full"
              size="lg"
            >
              {scanning ? 'Parar' : 'Iniciar Scanner'}
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

        {scanning && (
          <Card className="mt-4 bg-black border-gray-700">
            <div id="qr-reader" className="w-full aspect-square" />
          </Card>
        )}

        {lastResult && (
          <Card
            className={`mt-4 ${
              lastResult.type === 'success'
                ? 'bg-green-900 border-green-700'
                : lastResult.type === 'warning'
                ? 'bg-yellow-900 border-yellow-700'
                : 'bg-red-900 border-red-700'
            } border`}
          >
            <div className="text-center py-6">
              {lastResult.type === 'success' && (
                <CheckCircle className="w-16 h-16 mx-auto mb-2 text-green-400" />
              )}
              {lastResult.type === 'warning' && (
                <AlertTriangle className="w-16 h-16 mx-auto mb-2 text-yellow-400" />
              )}
              {lastResult.type === 'error' && (
                <XCircle className="w-16 h-16 mx-auto mb-2 text-red-400" />
              )}
              <h3 className="text-xl font-bold mb-1">{lastResult.message}</h3>
              {lastResult.participante && (
                <>
                  <p className="font-medium">{lastResult.participante.nome}</p>
                  <p className="text-sm text-gray-400">{lastResult.participante.email}</p>
                  {lastResult.participante.checkins?.length && (
                    <p className="text-sm text-gray-400 mt-2">
                      {formatDateTime(lastResult.participante.checkins[0].timestamp)}
                    </p>
                  )}
                </>
              )}
              <Button
                variant="ghost"
                onClick={() => setLastResult(null)}
                className="mt-4"
              >
               Próximo
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}