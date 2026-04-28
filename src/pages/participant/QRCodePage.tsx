import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Share } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import type { Evento, Participante } from '../../types'

export default function QRCodePage() {
  const { qrCode } = useParams<{ qrCode: string }>()
  const navigate = useNavigate()
  const [participante, setParticipante] = useState<Participante | null>(null)
  const [evento, setEvento] = useState<Evento | null>(null)

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
  }, [qrCode])

  const handleSaveImage = async () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `qr-${qrCode}.png`
      link.href = url
      link.click()
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  if (!participante || !evento) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="text-center">
          <p className="text-gray-500">QR Code não encontrado</p>
        </Card>
      </div>
    )
  }

  const qrValue = JSON.stringify({
    t: 'P',
    e: evento.id,
    p: participante.id,
    h: qrCode,
  })

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-1">QR Code de Entrada</h1>
          <p className="text-gray-400 text-sm">Apresente na entrada do evento</p>
        </div>

        <div className="bg-white p-6 rounded-2xl mb-6">
          <div className="flex justify-center mb-4">
            <QRCodeSVG 
              value={`${window.location.origin}/checkin/${evento.id}?qr=${qrCode}`}
              size={220}
              level="H"
              includeMargin
            />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">{participante.nome}</p>
            <p className="text-sm text-gray-500">{participante.email}</p>
          </div>
        </div>

        <Card className="bg-gray-800 border-gray-700 mb-4">
          <h2 className="font-semibold text-white mb-3">{evento.nome}</h2>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">📅</span>
              <span>{formatDate(evento.data)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">🕐</span>
              <span>{evento.horario}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">📍</span>
              <span>{evento.local}</span>
            </div>
          </div>
        </Card>

        <div className="space-y-2">
          <Button onClick={handleSaveImage} variant="secondary" className="w-full">
            <Download className="w-5 h-5 mr-2" />
            Salvar na Galeria
          </Button>
        </div>
      </div>
    </div>
  )
}