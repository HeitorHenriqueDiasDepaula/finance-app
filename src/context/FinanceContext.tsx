import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Transaction } from '../types/Transaction'
import { addTransaction as persistAddTransaction, getTransactions as getStoredTransactions, removeTransaction as persistRemoveTransaction, saveTransactions, updateTransaction as persistUpdateTransaction } from '../services/transactionsService'
import { createTransaction as createRemoteTransaction, deleteTransactionRemote, fetchTransactions, updateTransactionRemote } from '../services/api'

interface PaginationMeta {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

interface FinanceContextData {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  paginationMeta: PaginationMeta | null
  loadTransactions: (page?: number, limit?: number) => Promise<void>
  addTransaction: (transaction: Transaction) => Promise<void>
  removeTransaction: (id: string) => Promise<void>
  updateTransaction: (id: string, transaction: Transaction) => Promise<void>
}

const FinanceContext = createContext<FinanceContextData>(
  {} as FinanceContextData
)

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => getStoredTransactions())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null)

  async function loadTransactions(page = 1, limit = 50) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetchTransactions(page, limit)
      const nextTransactions = response.data ?? []
      setTransactions(nextTransactions)
      setPaginationMeta(response.meta)
      saveTransactions(nextTransactions)
    } catch (err) {
      const fallbackTransactions = getStoredTransactions()
      setTransactions(fallbackTransactions)
      setPaginationMeta({
        page,
        limit,
        totalItems: fallbackTransactions.length,
        totalPages: Math.max(1, Math.ceil(fallbackTransactions.length / limit)),
      })
      setError(err instanceof Error ? err.message : 'Erro ao carregar transações')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadTransactions(1, 50)
  }, [])

  async function addTransaction(transaction: Transaction) {
    try {
      const createdTransaction = await createRemoteTransaction({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
      })

      const nextTransactions = [createdTransaction, ...transactions.filter((item) => item.id !== createdTransaction.id)]
      setTransactions(nextTransactions)
      saveTransactions(nextTransactions)
      setError(null)
    } catch (err) {
      const fallbackTransactions = persistAddTransaction(transaction)
      setTransactions(fallbackTransactions)
      saveTransactions(fallbackTransactions)
      setError(err instanceof Error ? err.message : 'Erro ao salvar transação')
    }
  }

  async function removeTransaction(id: string) {
    try {
      await deleteTransactionRemote(id)
      const nextTransactions = persistRemoveTransaction(id)
      setTransactions(nextTransactions)
      saveTransactions(nextTransactions)
      setError(null)
    } catch (err) {
      const fallbackTransactions = persistRemoveTransaction(id)
      setTransactions(fallbackTransactions)
      saveTransactions(fallbackTransactions)
      setError(err instanceof Error ? err.message : 'Erro ao excluir transação')
    }
  }

  async function updateTransaction(id: string, transaction: Transaction) {
    try {
      const updatedTransaction = await updateTransactionRemote(id, {
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
      })

      const nextTransactions = transactions.map((item) => (item.id === id ? updatedTransaction : item))
      setTransactions(nextTransactions)
      saveTransactions(nextTransactions)
      setError(null)
    } catch (err) {
      const fallbackTransactions = persistUpdateTransaction(id, transaction)
      setTransactions(fallbackTransactions)
      saveTransactions(fallbackTransactions)
      setError(err instanceof Error ? err.message : 'Erro ao atualizar transação')
    }
  }

  const value = useMemo(
    () => ({ transactions, isLoading, error, paginationMeta, loadTransactions, addTransaction, removeTransaction, updateTransaction }),
    [transactions, isLoading, error, paginationMeta]
  )

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  return useContext(FinanceContext)
}
