import type { Transaction } from '../types/Transaction'

// Padrão: /api (o Vite repassa para o backend em desenvolvimento).
// Defina VITE_API_BASE_URL para apontar para um backend real, ex.: https://api.exemplo.com
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/+$/, '')

export interface ApiTransactionPayload {
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
}

export interface TransactionsResponse {
  data: Transaction[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)

  if (!response.ok) {
    let message = 'Não foi possível concluir a operação com o backend'
    try {
      const body = (await response.json()) as { error?: string }
      if (body?.error) {
        message = body.error
      }
    } catch {
      // resposta sem corpo JSON: mantém a mensagem padrão
    }
    throw new Error(message)
  }

  // 204 No Content (ex.: DELETE) não tem corpo para converter
  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export async function fetchTransactions(page = 1, limit = 50): Promise<TransactionsResponse> {
  return requestJson<TransactionsResponse>(`${API_BASE_URL}/transactions?page=${page}&limit=${limit}`)
}

export async function createTransaction(payload: ApiTransactionPayload): Promise<Transaction> {
  return requestJson<Transaction>(`${API_BASE_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function updateTransactionRemote(id: string, payload: ApiTransactionPayload): Promise<Transaction> {
  return requestJson<Transaction>(`${API_BASE_URL}/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function deleteTransactionRemote(id: string): Promise<void> {
  await requestJson<void>(`${API_BASE_URL}/transactions/${id}`, { method: 'DELETE' })
}
