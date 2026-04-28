import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode'
import { Check, X, AlertTriangle, Camera, Volume2, VolumeX } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import type { Evento, Participante } from '../../types'

interface CheckInResult {
  success: boolean
  message: string
  participante?: Participante
  timestamp?: string
}

export default function Checkin() {
  const { eventId } = useParams<{ eventId: string }>()
  const [scanning, setScanning] = useState(true)
  const [result, setResult] = useState<CheckInResult | null>(null)
  const [sound, setSound] = useState(true)
  const [evento, setEvento] = useState<Evento | null>(null)
  const [checkins, setCheckins] = useState<string[]>([])
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    const storedE = localStorage.getItem('eventos')
    if (storedE) {
      const eventos = JSON.parse(storedE) as Evento[]
      const ev = eventos.find(e => e.id === eventId)
      if (ev) setEvento(ev)
    }

    const storedCheckins = localStorage.getItem('checkins_' + eventId)
    if (storedCheckins) {
      setCheckins(JSON.parse(storedCheckins))
    }
  }, [eventId])

  useEffect(() => {
    if (!scanning) return

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    )
    scannerRef.current = scanner

    scanner.render(
      (decodedText) => {
        handleScan(decodedText)
        scanner.clear()
        setScanning(false)
      },
      (error) => {
        // Ignore scan errors
      }
    )

    return () => {
      scanner.clear()
    }
  }, [scanning, checkins])

  const handleScan = (decodedText: string) => {
    try {
      let qrCode = decodedText
      
      if (decodedText.includes('qr=')) {
        const params = new URL(decodedText)
        qrCode = params.searchParams.get('qr') || decodedText
      }
      
      const stored = localStorage.getItem('participantes')
      if (!stored) {
        setResult({
          success: false,
          message: 'Nenhum participante encontrado',
        })
        playSound(false)
        return
      }

      const parts = JSON.parse(stored) as Participante[]
      const participante = parts.find(
        p => p.qrCode === qrCode && p.eventoId === eventId
      )

      if (!participante) {
        setResult({
          success: false,
          message: 'QR Code não encontrado neste evento',
        })
        playSound(false)
        return
      }

      if (!participante.confirmado) {
        setResult({
          success: false,
          message: 'Participante não confirmou presença',
          participante,
        })
        playSound(false)
        return
      }

      if (checkins.includes(participante.id)) {
        const existing = checkins.find(c => c === participante.id)
        setResult({
          success: false,
          message: 'QR Code já utilizado!',
          participante,
          timestamp: new Date().toISOString(),
        })
        playSound(false)
        return
      }

      const novosCheckins = [...checkins, participante.id]
      setCheckins(novosCheckins)
      localStorage.setItem('checkins_' + eventId, JSON.stringify(novosCheckins))

      setResult({
        success: true,
        message: 'Check-in realizado!',
        participante,
        timestamp: new Date().toISOString(),
      })
      playSound(true)
    } catch (err) {
      setResult({
        success: false,
        message: 'QR Code inválido',
      })
      playSound(false)
    }
  }

  const playSound = (success: boolean) => {
    if (!sound) return
    
    const audio = new Audio(
      success 
        ? 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleScFPKbR26hQABc1j9/WsWsZAS+t0d+0WAcKJovg1b17DAkfhN3iu3sOCBt4n+DAfwUIEnaa38GABQgAZptgS'
        : 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleScFPKbR26hQABc1j9/WsWsZAS+t0d+0WAcKJovg1b17DAkfhN3iu3sOCBt4n+DAfwUIEnaa38GABQgAZptgS'
    )
    audio.play().catch(() => {})
  }

  const handleReset = () => {
    setResult(null)
    setScanning(true)
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  if (result?.success) {
    return (
      <div className="min-h-screen bg-green-500 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Check className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SUCESSO!</h1>
          <div className="bg-white rounded-2xl p-6 mb-6">
            <p className="text-2xl font-bold text-gray-900 mb-1">{result.participante?.nome}</p>
            <p className="text-gray-500 mb-4">{result.participante?.email}</p>
            <p className="text-green-600 font-medium">{formatTime(result.timestamp!)}</p>
          </div>
          <Button onClick={handleReset} variant="secondary" className="w-full">
            <Camera className="w-5 h-5 mr-2" />
            Próximo
          </Button>
        </div>
      </div>
    )
  }

  if (result && !result.success) {
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ERRO</h1>
          <div className="bg-white rounded-2xl p-6 mb-6">
            <p className="text-lg font-medium text-gray-900 mb-4">{result.message}</p>
            {result.participante && (
              <>
                <p className="text-xl font-bold text-gray-900">{result.participante.nome}</p>
                <p className="text-gray-500">{result.participante.email}</p>
              </>
            )}
          </div>
          <Button onClick={handleReset} variant="secondary" className="w-full">
            <Camera className="w-5 h-5 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Check-in</h1>
            {evento && <p className="text-sm text-gray-400">{evento.nome}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSound(!sound)} className="p-2 bg-gray-700 rounded-lg">
              {sound ? <Volume2 className="w-5 h-5 text-white" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Camera className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white">Escaneie o QR Code</h2>
            <p className="text-gray-400 mt-1">Aponte a câmera para o QR Code do participante</p>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden">
            <div id="qr-reader" className="w-full" />
          </div>

          <Card className="mt-4 bg-gray-800 border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Check-ins hoje:</span>
              <span className="text-2xl font-bold text-white">{checkins.length}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}