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
  Share2,
  Plus,
  Calendar,
  MapPin,
  Clock,
  Save,
} from 'lucide-react'
import { Button, Card, Input, Badge, Modal } from '../components/ui'
import { QRCodeGenerator } from '../components/qr'
import { useEventoStore, useParticipanteStore, type Participante, type Evento } from '../stores'
import { generateId, generateQRCode, generateInviteLink, formatDate, formatDateTime, downloadCSV } from '../lib/utils'

export function EventoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { eventos, eventoAtual, setEventoAtual, addEvento, updateEvento, removeEvento, fetchEventos } = useEventoStore()
  const { participantes, addParticipante, addParticipantes, removeParticipante, fetchParticipantes } =
    useParticipanteStore()
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [novoParticipante, setNovoParticipante] = useState({ nome: '', email: '', telefone: '' })
  const [csvData, setCsvData] = useState('')
  const [isNewEvent, setIsNewEvent] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    data: '',
    horario: '',
    local: '',
  })

  useEffect(() => {
    if (id === 'novo') {
      setIsNewEvent(true)
      setEventoAtual(null)
      setLoading(false)
      return
    }

    const loadData = async () => {
      await fetchEventos()
      await fetchParticipantes(id)
    }
    
    loadData().then(() => {
      setLoading(false)
    })
  }, [id, fetchEventos, fetchParticipantes, setEventoAtual])

  useEffect(() => {
    if (id !== 'novo' && eventos.length > 0) {
      const evento = eventos.find((e) => e.id === id)
      if (evento) {
        setEventoAtual(evento)
      }
    }
  }, [eventos, id, setEventoAtual])

  const eventoParticipantes = participantes.filter((p) => p.eventoId === (id || eventoAtual?.id))

  const handleCreateEvento = async () => {
    if (!formData.nome || !formData.data || !formData.horario || !formData.local) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    const novoEvento = {
      id: '', // Placeholder, será gerado pelo BD
      nome: formData.nome,
      descricao: formData.descricao,
      data: formData.data,
      horario: formData.horario,
      local: formData.local,
      organizadorId: '1',
      stats: { total: 0, confirmados: 0, compareceu: 0 },
    }

    try {
      const created = await addEvento(novoEvento)
      if (created && created.id) {
        navigate(`/evento/${created.id}`)
      } else {
        alert('Erro: Evento criado mas sem ID retornado.')
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    }
  }

  const handleAddParticipante = () => {
    if (!novoParticipante.nome || !novoParticipante.email) return

    const eventoId = eventoAtual?.id || id || ''
    const participanteId = generateId()
    const qrCode = generateId()

    const novo: Participante = {
      id: participanteId,
      nome: novoParticipante.nome,
      email: novoParticipante.email,
      telefone: novoParticipante.telefone,
      eventoId,
      qrCode,
      confirmado: false,
    }

    addParticipante(novo)
    setNovoParticipante({ nome: '', email: '', telefone: '' })
    setShowAddModal(false)

    // Atualizar stats do evento
    const total = eventoParticipantes.length + 1
    const confirmados = eventoParticipantes.filter((p) => p.confirmado).length
    updateEvento(eventoId, { stats: { total, confirmados, compareceu: 0 } })
  }

  const handleImportCSV = () => {
    const lines = csvData.trim().split('\n')
    const eventoId = eventoAtual?.id || id || ''

    const novos: Participante[] = lines
      .slice(1)
      .map((line) => {
        const [nome, email, telefone] = line.split(',')
        return {
          id: generateId(),
          nome: nome?.trim() || '',
          email: email?.trim() || '',
          telefone: telefone?.trim(),
          eventoId,
          qrCode: generateId(),
          confirmado: false,
        }
      })
      .filter((p) => p.nome && p.email)

    addParticipantes(novos)
    setCsvData('')
    setShowImportModal(false)

    // Atualizar stats
    const total = eventoParticipantes.length + novos.length
    updateEvento(eventoId, { stats: { total, confirmados: 0, compareceu: 0 } })
  }

  const handleExportCSV = () => {
    const data = eventoParticipantes.map((p) => ({
      nome: p.nome,
      email: p.email,
      telefone: p.telefone || '',
      confirmado: p.confirmado ? 'Sim' : 'Não',
      confirmadoEm: p.confirmadoEm ? formatDateTime(p.confirmadoEm) : '',
      checkin: p.checkins?.length ? 'Sim' : 'Não',
    }))
    downloadCSV(data, eventoAtual?.nome || 'evento')
  }

  const handleCopyLink = () => {
    const link = `${window.location.origin}/confirmar/${btoa(`C:${eventoAtual?.nome}:Participante:email@email.com`)}`
    navigator.clipboard.writeText(link)
    alert('Link copiado! Compartilhe no grupo.')
  }

  const handleSendInvite = (participante: Participante) => {
    const link = generateInviteLink(
      eventoAtual?.id || '',
      eventoAtual?.nome || '',
      participante.nome,
      participante.email
    )
    const message = `Olá ${participante.nome}! Você foi convidado para *${eventoAtual?.nome}*.\n📅 ${formatDate(eventoAtual?.data || '')} às ${eventoAtual?.horario}\n📍 ${eventoAtual?.local}\n\nConfirme sua presença aqui:\n${link}`
    const whatsappLink = `https://wa.me/${participante.telefone?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(message)}`
    window.open(whatsappLink, '_blank')
  }

  const handleShareAll = async () => {
    const naoConfirmados = eventoParticipantes.filter((p) => !p.confirmado && p.telefone)
    if (naoConfirmados.length === 0) {
      alert('Todos os participantes já confirmaram ou não têm telefone cadastrado.')
      return
    }
    for (const p of naoConfirmados) {
      handleSendInvite(p)
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  const handleDeleteEvento = () => {
    if (eventoAtual) {
      removeEvento(eventoAtual.id)
      // Remover participantes do evento
      eventoParticipantes.forEach((p) => removeParticipante(p.id))
    }
    navigate('/dashboard')
  }

  const handleRemoveParticipante = (participanteId: string) => {
    removeParticipante(participanteId)
  }

  const confirmados = eventoParticipantes.filter((p) => p.confirmado).length
  const compareceu = eventoParticipantes.filter((p) => p.checkins && p.checkins.length > 0).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  // Formulário de criação de evento
  if (isNewEvent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-1 hover:bg-gray-100 rounded">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">Novo Evento</h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-4">
          <Card>
            <div className="space-y-4">
              <Input
                label="Nome do Evento *"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Workshop React Avançado"
              />
              <Input
                label="Descrição"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Breve descrição do evento"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Data *"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                />
                <Input
                  label="Horário *"
                  type="time"
                  value={formData.horario}
                  onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                />
              </div>
              <Input
                label="Local *"
                value={formData.local}
                onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                placeholder="Ex: Auditório Principal"
              />
              <Button onClick={handleCreateEvento} className="w-full flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                Criar Evento
              </Button>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  if (!eventoAtual) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Evento não encontrado</p>
          <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
        </Card>
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
            {eventoAtual.nome}
          </h1>
          <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-red-600 hover:bg-red-50 rounded">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
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
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {eventoAtual.horario}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {eventoAtual.local}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{eventoParticipantes.length}</div>
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
          <Button variant="primary" onClick={handleShareAll} className="flex items-center justify-center gap-2 col-span-2 sm:col-span-4">
            <Share2 className="w-4 h-4" />
            Enviar Todos via WhatsApp
          </Button>
        </div>

        <Card padding="none">
          <div className="p-4 border-b font-semibold flex items-center justify-between">
            <span>Participantes ({eventoParticipantes.length})</span>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1 hover:bg-gray-100 rounded text-blue-600"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="divide-y max-h-96 overflow-auto">
            {eventoParticipantes.map((p) => (
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
                  <button
                    onClick={() => handleRemoveParticipante(p.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {p.checkins?.length ? (
                    <Badge variant="success">✓ Check-in</Badge>
                  ) : p.confirmado ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300" />
                  )}
                </div>
              </div>
            ))}
            {eventoParticipantes.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                Nenhum participante adicionado
                <br />
                <Button variant="outline" onClick={() => setShowAddModal(true)} className="mt-3">
                  Adicionar Participante
                </Button>
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
            label="Telefone (WhatsApp)"
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
            placeholder={"nome,email,telefone\nJoão Silva,joao@email.com,(11) 99999-9999\nMaria Santos,maria@email.com,"}
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
          <QRCodeGenerator value={`${window.location.origin}/portaria/${eventoAtual.id}`} size={250} />
          <p className="text-sm text-gray-500 mt-4 text-center">
            Escaneie este QR para abrir a interface de portaria
          </p>
          <Button
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/portaria/${eventoAtual.id}`)
              alert('Link copiado!')
            }}
            className="mt-2"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar Link
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Excluir Evento">
        <p className="text-gray-600 mb-4">
          Tem certeza que deseja excluir <strong>{eventoAtual.nome}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteEvento} className="flex-1">
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  )
}