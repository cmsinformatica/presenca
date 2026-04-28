import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  QrCode,
  Send,
  Download,
  CheckCircle,
  XCircle,
  Copy,
  Trash2,
  AlertCircle,
  Loader,
  Link,
  Share2,
} from 'lucide-react'
import { Button, Card, Input, Badge, Modal } from '../components/ui'
import { QRCodeGenerator } from '../components/qr'
import { useEventoStore, useParticipanteStore, type Participante, type Evento } from '../stores'
import { generateId, formatDate, formatDateTime, downloadCSV, generateInviteLink } from '../lib/utils'

export function EventoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { eventoAtual, setEventoAtual, addEvento, removeEvento } = useEventoStore()
  const { participantes, setParticipantes, addParticipante, addParticipantes, removeParticipante } =
    useParticipanteStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [novoParticipante, setNovoParticipante] = useState({ nome: '', email: '', telefone: '' })
  const [csvData, setCsvData] = useState('')

  useEffect(() => {
    if (id === 'novo') {
      setEventoAtual(null)
      setParticipantes([])
      setLoading(false)
      return
    }

    setError(null)

    const timer = setTimeout(() => {
      try {
        const evento = { id: id || '1', nome: 'Workshop React', descricao: 'Workshop de React Avançado', data: '2026-05-15', horario: '14:00', local: 'Auditório Principal', organizadorId: '1', stats: { total: 50, confirmados: 38, compareceu: 32 } }
        setEventoAtual(evento)
        setParticipantes([
          { id: '1', nome: 'João Silva', email: 'joao@email.com', eventoId: '1', qrCode: 'qr1', confirmado: true, confirmadoEm: '2026-05-10T10:00:00Z' },
          { id: '2', nome: 'Maria Santos', email: 'maria@email.com', eventoId: '1', qrCode: 'qr2', confirmado: true, confirmadoEm: '2026-05-11T14:00:00Z' },
          { id: '3', nome: 'Pedro Costa', email: 'pedro@email.com', eventoId: '1', qrCode: 'qr3', confirmado: false },
        ])
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar evento')
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [id, setEventoAtual, setParticipantes])

  const handleAddParticipante = () => {
    if (!novoParticipante.nome || !novoParticipante.email) return

    const participante: Participante = {
      id: generateId(),
      nome: novoParticipante.nome,
      email: novoParticipante.email,
      telefone: novoParticipante.telefone,
      eventoId: id || '1',
      qrCode: generateId(),
      confirmado: false,
    }

    addParticipante(participante)
    setNovoParticipante({ nome: '', email: '', telefone: '' })
    setShowAddModal(false)
  }

  const handleImportCSV = () => {
    const lines = csvData.trim().split('\n')
    const novos: Participante[] = lines.slice(1).map((line) => {
      const [nome, email, telefone] = line.split(',')
      return {
        id: generateId(),
        nome: nome?.trim() || '',
        email: email?.trim() || '',
        telefone: telefone?.trim(),
        eventoId: id || '1',
        qrCode: generateId(),
        confirmado: false,
      }
    }).filter((p) => p.nome && p.email)

    addParticipantes(novos)
    setCsvData('')
    setShowImportModal(false)
  }

  const handleExportCSV = () => {
    const data = participantes.map((p) => ({
      nome: p.nome,
      email: p.email,
      telefone: p.telefone || '',
      confirmado: p.confirmado ? 'Sim' : 'Não',
      confirmadoEm: p.confirmadoEm ? formatDateTime(p.confirmadoEm) : '',
    }))
    downloadCSV(data, eventoAtual?.nome || 'evento')
  }

  const handleCopyLink = () => {
    const link = `${window.location.origin}/e/${eventoAtual?.id}`
    navigator.clipboard.writeText(link)
  }

  const handleSendInvite = (participante: Participante) => {
    const link = `${window.location.origin}/e/${eventoAtual?.id}`
    const message = `Olá ${participante.nome}! Você foi convite para ${eventoAtual?.nome}. Confirme sua presença aqui: ${link}`
    const whatsappLink = `https://wa.me/${participante.telefone?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(message)}`
    window.open(whatsappLink, '_blank')
  }

  const handleShareAll = async () => {
    for (const p of participantes) {
      if (!p.confirmado && p.telefone) {
        handleSendInvite(p)
        await new Promise(r => setTimeout(r, 1000))
      }
    }
  }

  const confirmados = participantes.filter((p) => p.confirmado).length
  const compareceu = participantes.filter((p) => p.checkins && p.checkins.length > 0).length

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-1 hover:bg-gray-100 rounded">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold flex-1 truncate">
            {eventoAtual?.nome || 'Novo Evento'}
          </h1>
          {id !== 'novo' && (
            <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-red-600 hover:bg-red-50 rounded">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {eventoAtual && (
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{eventoAtual.nome}</h2>
                {eventoAtual.descricao && (
                  <p className="text-gray-500 mt-1">{eventoAtual.descricao}</p>
                )}
              </div>
              <Badge variant="info">{formatDate(eventoAtual.data)}</Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>{eventoAtual.horario}</span>
              <span>{eventoAtual.local}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{participantes.length}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{confirmados}</div>
                <div className="text-sm text-gray-500">Confirmados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{compareceu}</div>
                <div className="text-sm text-gray-500">Compareceu</div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button variant="outline" onClick={() => setShowAddModal(true)} className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            Adicionar
          </Button>
          <Button variant="outline" onClick={() => setShowImportModal(true)} className="flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Importar
          </Button>
          <Button variant="outline" onClick={handleExportCSV} className="flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            Exportar
          </Button>
          <Button variant="outline" onClick={() => setShowQRModal(true)} className="flex items-center justify-center gap-2">
            <QrCode className="w-4 h-4" />
            QR Portaria
          </Button>
          <Button variant="primary" onClick={handleShareAll} className="flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" />
            Enviar Todos
          </Button>
        </div>

        <Card padding="none">
          <div className="p-4 border-b font-semibold">Participantes ({participantes.length})</div>
          <div className="divide-y max-h-96 overflow-auto">
            {participantes.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.nome}</div>
                  <div className="text-sm text-gray-500">{p.email}</div>
                  {p.telefone && <div className="text-sm text-gray-400">{p.telefone}</div>}
                </div>
                <div className="flex items-center gap-2">
                  {!p.confirmado && p.telefone && (
                    <button
                      onClick={() => handleSendInvite(p)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Enviar convite"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                  {p.confirmado ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300" />
                  )}
                </div>
              </div>
            ))}
            {participantes.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Nenhum participante adicionado
              </div>
            )}
          </div>
        </Card>
      </main>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Adicionar Participante">
        <div className="space-y-4">
          <Input
            label="Nome"
            value={novoParticipante.nome}
            onChange={(e) => setNovoParticipante({ ...novoParticipante, nome: e.target.value })}
            placeholder="João Silva"
          />
          <Input
            label="Email"
            type="email"
            value={novoParticipante.email}
            onChange={(e) => setNovoParticipante({ ...novoParticipante, email: e.target.value })}
            placeholder="joao@email.com"
          />
          <Input
            label="Telefone"
            value={novoParticipante.telefone}
            onChange={(e) => setNovoParticipante({ ...novoParticipante, telefone: e.target.value })}
            placeholder="(11) 99999-9999"
          />
          <Button onClick={handleAddParticipante} className="w-full">
            Adicionar
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Importar CSV">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            O CSV deve ter as colunas: nome,email,telefone (header obrigatório)
          </p>
          <textarea
            className="w-full h-32 p-3 border rounded-lg font-mono text-sm"
            placeholder="nome,email,telefone&#10;João Silva,joao@email.com,(11) 99999-9999&#10;Maria Santos,maria@email.com,"
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
          />
          <Button onClick={handleImportCSV} className="w-full">
            Importar
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showQRModal} onClose={() => setShowQRModal(false)} title="QR Code Portaria">
        <div className="flex flex-col items-center">
          <QRCodeGenerator value={`portaria:${eventoAtual?.id}`} size={250} />
          <p className="text-sm text-gray-500 mt-4 text-center">
            Escaneie este QR para abrir a interface de portaria
          </p>
          <Button variant="ghost" onClick={handleCopyLink} className="mt-2">
            <Copy className="w-4 h-4 mr-2" />
            Copiar Link
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Excluir Evento">
        <p className="text-gray-600 mb-4">Tem certeza que deseja excluir este evento?</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => navigate('/dashboard')} className="flex-1">
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  )
}