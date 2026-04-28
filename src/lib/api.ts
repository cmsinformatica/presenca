const API_URL = import.meta.env.VITE_API_URL || '/api'

interface RequestOptions extends RequestInit {
  token?: string
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, body, method = 'GET', ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro na requisição' }))
    throw new Error(error.error || 'Erro na requisição')
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string, token?: string) => request<T>(endpoint, { method: 'GET', token }),
  post: <T>(endpoint: string, data?: unknown, token?: string) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(data), token }),
  put: <T>(endpoint: string, data?: unknown, token?: string) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data), token }),
  delete: <T>(endpoint: string, token?: string) => request<T>(endpoint, { method: 'DELETE', token }),
}