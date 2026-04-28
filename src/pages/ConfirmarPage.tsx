import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, AlertTriangle, Loader } from 'lucide-react'
import { Button, Card, Input } from '../components/ui'
import { QRCodeGenerator } from '../components/qr'

interface Evento {
  id: string
  nome: string
  descricao?: string
  data: string
  horario: string
  local: string
}

export function ConfirmarPage() {
  const { eventoId } = useParams<{ eventoId: string }>()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [erro, setErro] = useState('')
  const [evento, setEvento] = useState<Evento | null>(null)
  const [confirmado, setConfirmado] = useState(false)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [qrCode, setQrCode] = useState('')

  useEffect(() => {
    if (!eventoId) {
      setErro('Evento inválido')
      setLoading(false)
      return
    }

    fetch(`/api/evento?id=${eventoId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setErro(data.error)
        } else {
          setEvento(data)
        }
        setLoading(false)
      })
      .catch(() => {
        setErro('Evento não encontrado')
        setLoading(false)
      })
  }, [eventoId])

  const handleConfirmar = async () => {
    if (!nome || !telefone) {
      setErro('Preencha nome e telefone')
      return
    }

    setSubmitting(true)
    setErro('')

    try {
      const res = await fetch('/api/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventoId, nome, telefone }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.error || 'Erro ao confirmar')
        setSubmitting(false)
        return
      }

      setQrCode(data.qrCode)
      setConfirmado(true)
    } catch {
      setErro('Erro ao confirmar')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (erro && !evento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="text-center max-w-sm">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{erro}</p>
        </Card>
      </div>
    )
  }

  if (confirmado && qrCode) {
    return (
      <div className="min-h-screen bg-green-50 p-4">
        <Card className="max-w-sm mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-green-800">Confirmado!</h2>
          <p className="text-gray-600">Sua presença foi confirmada</p>
        </Card>

        <Card className="max-w-sm mx-auto mt-4 text-center">
          <h3 className="font-semibold mb-4">Seu QR Code de Entrada</h3>
          <div className="flex justify-center">
            <QRCodeGenerator value={qrCode} size={220} />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Mostre este QR Code na entrada do evento
          </p>
        </Card>

        {evento && (
          <Card className="max-w-sm mx-auto mt-4">
            <h3 className="font-semibold mb-2">{evento.nome}</h3>
            <p className="text-sm text-gray-600">
              {new Date(evento.data).toLocaleDateString('pt-BR')} às {evento.horario}
            </p>
            <p className="text-sm text-gray-600">{evento.local}</p>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="max-w-sm mx-auto">
        <h2 className="text-xl font-bold mb-2">Confirmar Presença</h2>
        <p className="text-gray-600 mb-4">
          Preencha seus dados para confirmar
        </p>

        {evento && (
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="font-medium">{evento.nome}</p>
            <p className="text-sm text-gray-600">
              {new Date(evento.data).toLocaleDateString('pt-BR')} às {evento.horario}
            </p>
            <p className="text-sm text-gray-600">{evento.local}</p>
          </div>
        )}

        <div className="space-y-3">
          <Input
            label="Seu Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="João Silva"
          />
          <Input
            label="WhatsApp"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(11) 99999-9999"
          />
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
          <Button
            onClick={handleConfirmar}
            loading={submitting}
            className="w-full"
          >
            Confirmar Presença
          </Button>
        </div>
      </Card>
    </div>
  )
}