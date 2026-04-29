import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, AlertTriangle, Loader2, QrCode } from 'lucide-react'
import { Button, Card, Input } from '../components/ui'
import { QRCodeGenerator } from '../components/qr'
import { useParticipanteStore } from '../stores'
import { generateId } from '../lib/utils'

interface ConfirmData {
  nome: string
  email: string
  eventoNome: string
}

export function ConfirmarPage() {
  const { codigo } = useParams<{ codigo: string }>()
  const navigate = useNavigate()
  const { participantes, addParticipante, updateParticipante } = useParticipanteStore()

  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [confirmado, setConfirmado] = useState(false)
  const [dados, setDados] = useState<ConfirmData | null>(null)
  const [telefone, setTelefone] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!codigo) { setErro('Código inválido'); setLoading(false); return }
    const timer = setTimeout(() => {
      try {
        const decoded = atob(codigo)
        const parts = decoded.split(':')
        if (parts.length < 4) { setErro('Link expirado ou inválido'); setLoading(false); return }
        const [, eventoNome, nome, email] = parts
        const existing = participantes.find((p) => p.email === email && p.nome === nome)
        if (existing?.confirmado) { setDados({ nome, email, eventoNome }); setConfirmado(true) }
        else { setDados({ nome, email, eventoNome }) }
        setLoading(false)
      } catch { setErro('Link inválido'); setLoading(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [codigo, participantes])

  const handleConfirmar = async () => {
    if (!telefone || telefone.replace(/\D/g, '').length < 10) { alert('Digite um telefone válido com DDD'); return }
    if (!dados || !codigo) return
    setEnviando(true)
    try {
      const existing = participantes.find((p) => p.email === dados.email && p.nome === dados.nome)
      if (existing) {
        updateParticipante(existing.id, { confirmado: true, confirmadoEm: new Date().toISOString(), telefone })
      } else {
        addParticipante({ id: generateId(), nome: dados.nome, email: dados.email, telefone, eventoId: '', qrCode: generateId(), confirmado: true, confirmadoEm: new Date().toISOString() })
      }
      fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'confirm', participanteNome: dados.nome, eventNome: dados.eventoNome, telefone }) }).catch(() => {})
      setConfirmado(true)
    } catch { alert('Erro ao confirmar.') } finally { setEnviando(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

  if (erro) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="text-center max-w-sm">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">Ops!</h2>
        <p className="text-gray-600">{erro}</p>
        <Button onClick={() => navigate('/')} className="mt-4">Voltar</Button>
      </Card>
    </div>
  )

  if (confirmado && dados) {
    const qrValue = JSON.stringify({ t: 'P', e: btoa(dados.eventoNome || ''), p: codigo })
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4">
        <Card className="max-w-sm mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-green-800 mb-2">Presença Confirmada!</h2>
          <p className="text-gray-600">{dados.nome}</p>
          <p className="text-sm text-gray-500">{dados.email}</p>
        </Card>
        <Card className="max-w-sm mx-auto mt-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Seu QR Code de Entrada</h3>
          </div>
          <div className="flex justify-center"><QRCodeGenerator value={qrValue} size={220} level="H" /></div>
          <p className="text-sm text-gray-500 mt-4">Mostre este QR Code na entrada do evento</p>
          <p className="text-xs text-gray-400 mt-2">📱 Salve uma captura de tela</p>
        </Card>
        <Card className="max-w-sm mx-auto mt-4">
          <h3 className="font-semibold mb-2">Evento</h3>
          <p className="text-gray-700">{dados.eventoNome}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3"><QrCode className="w-8 h-8 text-blue-600" /></div>
          <h2 className="text-xl font-bold">Confirmar Presença</h2>
          <p className="text-gray-500 mt-1">{dados?.eventoNome}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="font-medium text-gray-900">{dados?.nome}</p>
          <p className="text-sm text-gray-600">{dados?.email}</p>
        </div>
        <div className="space-y-4">
          <Input label="Seu Telefone (WhatsApp) *" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" />
          <Button onClick={handleConfirmar} loading={enviando} className="w-full" size="lg">
            <CheckCircle className="w-5 h-5 mr-2" />Confirmar Presença
          </Button>
        </div>
      </Card>
    </div>
  )
}