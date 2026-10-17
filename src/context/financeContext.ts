import { createContext } from 'react'
import type { Transaction } from '../types/Transaction'

export interface PaginationMeta {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface FinanceContextData {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  paginationMeta: PaginationMeta | null
  loadTransactions: (page?: number, limit?: number) => Promise<void>
  addTransaction: (transaction: Transaction) => Promise<void>
  removeTransaction: (id: string) => Promise<void>
  updateTransaction: (id: string, transaction: Transaction) => Promise<void>
}

export const FinanceContext = createContext<FinanceContextData | null>(null)
