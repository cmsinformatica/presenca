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

  // Estado para participantes e evento
  const [novoParticipante, setNovoParticipante] = useState({ nome: '', email: '', telefone: '' })
  const { eventoAtual, setEventoAtual, addEvento, removeEvento } = useEventoStore()
  const { participantes, setParticipantes, addParticipante, addParticipantes, removeParticipante } =
    useParticipanteStore()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [csvData, setCsvData] = useState('')

  // Restante do useEffect e outras funções

  return (
    <div>
      {/* Seu JSX aqui */}
    </div>
  )
}