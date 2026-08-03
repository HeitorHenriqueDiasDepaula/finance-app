import type { Transaction } from '../types/Transaction'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

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
    throw new Error('Não foi possível concluir a operação com o backend')
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
