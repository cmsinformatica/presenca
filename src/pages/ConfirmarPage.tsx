import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, AlertTriangle, Loader2, Send, QrCode } from 'lucide-react'
import { Button, Card, Input } from '../components/ui'
import { QRCodeGenerator } from '../components/qr'
import { useEventoStore } from '../stores'
import { formatDate, formatTime } from '../lib/utils'

interface ConfirmData {
  nome: string
  email: string
  telefone: string
  confirmado: boolean
}

export function ConfirmarPage() {
  const {codigo} = useParams<{codigo: string}>()
  const navigate = useNavigate()
  const { eventoAtual } = useEventoStore()
  
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [confirmado, setConfirmado] = useState(false)
  const [dados, setDados] = useState<ConfirmData | null>(null)
  const [telefone, setTelefone] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!codigo) {
      setErro('Código inválido')
      setLoading(false)
      return
    }

    const timer = setTimeout(() => {
      try {
        const parts = atob(codigo).split(':')
        if (parts.length < 3) {
          setErro('Link expirado ou inválido')
          setLoading(false)
          return
        }

        const [_tipo, eventoNome, nome] = parts
        setDados({
          nome: nome,
          email: parts[2] || '',
          telefone: '',
          confirmado: false,
        })
        setLoading(false)
      } catch {
        setErro('Link inválido')
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [codigo])

  const handleConfirmar = async () => {
    if (!telefone || telefone.length < 10) {
      alert('Digite um telefone válido')
      return
    }

    setEnviando(true)

    await new Promise(r => setTimeout(r, 1000))

    setConfirmado(true)
    setEnviando(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="text-center max-w-sm">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Ops!</h2>
          <p className="text-gray-600">{erro}</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Voltar
          </Button>
        </Card>
      </div>
    )
  }

  if (confirmado) {
    const qrValue = JSON.stringify({
      t: 'P',
      e: btoa(dados?.nome || ''),
      p: codigo,
    })

    return (
      <div className="min-h-screen bg-green-50 p-4">
        <Card className="max-w-sm mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-green-800 mb-2">
            confirmed!
          </h2>
          <p className="text-gray-600 mb-6">
            Sua presença foi confirmada
          </p>
        </Card>

        <Card className="max-w-sm mx-auto mt-4 text-center">
          <h3 className="font-semibold mb-4">Seu QR Code de Entrada</h3>
          <div className="flex justify-center">
            <QRCodeGenerator value={qrValue} size={220} />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Mostre este QR Code na entrada do evento
          </p>
        </Card>

        <Card className="max-w-sm mx-auto mt-4">
          <h3 className="font-semibold mb-2">Detalhes do Evento</h3>
          <p className="text-gray-600">{eventoAtual?.nome || 'Workshop React'}</p>
          <p className="text-sm text-gray-500">
            {formatDate(eventoAtual?.data || '2026-05-15')} às {eventoAtual?.horario || '14:00'}
          </p>
          <p className="text-sm text-gray-500">{eventoAtual?.local || 'Auditório Principal'}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="max-w-sm mx-auto">
        <h2 className="text-xl font-bold mb-2">Confirmar Presença</h2>
        <p className="text-gray-600 mb-4">
          Você foi convite para o evento
        </p>

        <div className="bg-blue-50 p-3 rounded-lg mb-4">
          <p className="font-medium">{dados?.nome}</p>
          <p className="text-sm text-gray-600">{dados?.email}</p>
        </div>

        <div className="space-y-3">
          <Input
            label="Seu Telefone (com WhatsApp)"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(11) 99999-9999"
          />
          <Button
            onClick={handleConfirmar}
            loading={enviando}
            className="w-full"
          >
            Confirmar Presença
          </Button>
        </div>
      </Card>
    </div>
  )
}