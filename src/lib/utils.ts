export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function generateQRCode(eventoId: string, participanteId: string): string {
  const data = {
    t: 'P',
    e: eventoId,
    p: participanteId,
    h: btoa(`${eventoId}:${participanteId}`),
  }
  return JSON.stringify(data)
}

export function generateInviteLink(eventoId: string, eventoNome: string, nome: string, email: string): string {
  const payload = `C:${eventoNome}:${nome}:${email}`
  const code = btoa(payload)
  return `${window.location.origin}/confirmar/${code}`
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR')
}

export function formatTime(time: string): string {
  return time
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  return phone
}

export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function downloadCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const rows = data.map((row) => headers.map((h) => String(row[h] ?? '')).join(','))
  const csv = [headers.join(','), ...rows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
}