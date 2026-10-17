import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Transaction } from '../types/Transaction'
import {
  getTransactions as getStoredTransactions,
  saveTransactions,
} from '../services/transactionsService'
import {
  createTransaction as createRemoteTransaction,
  deleteTransactionRemote,
  fetchTransactions,
  updateTransactionRemote,
} from '../services/api'
import { FinanceContext, type PaginationMeta } from './financeContext'

function toPayload(transaction: Transaction) {
  return {
    description: transaction.description,
    amount: transaction.amount,
    type: transaction.type,
    category: transaction.category,
    date: transaction.date,
  }
}

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => getStoredTransactions())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null)

  // Atualiza o estado e o cache local (usado como fallback quando o backend cai)
  const commit = useCallback((next: Transaction[]) => {
    setTransactions(next)
    saveTransactions(next)
  }, [])

  const loadTransactions = useCallback(
    async (page = 1, limit = 50) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetchTransactions(page, limit)
        commit(response.data ?? [])
        setPaginationMeta(response.meta)
      } catch (err) {
        const fallback = getStoredTransactions()
        setTransactions(fallback)
        setPaginationMeta({
          page,
          limit,
          totalItems: fallback.length,
          totalPages: Math.max(1, Math.ceil(fallback.length / limit)),
        })
        setError(errorMessage(err, 'Erro ao carregar transações'))
      } finally {
        setIsLoading(false)
      }
    },
    [commit],
  )

  useEffect(() => {
    void loadTransactions(1, 50)
  }, [loadTransactions])

  const addTransaction = useCallback(
    async (transaction: Transaction) => {
      try {
        const created = await createRemoteTransaction(toPayload(transaction))
        commit([created, ...transactions.filter((item) => item.id !== created.id)])
        setError(null)
      } catch (err) {
        commit([transaction, ...transactions])
        setError(errorMessage(err, 'Erro ao salvar transação'))
      }
    },
    [transactions, commit],
  )

  const removeTransaction = useCallback(
    async (id: string) => {
      try {
        await deleteTransactionRemote(id)
        setError(null)
      } catch (err) {
        setError(errorMessage(err, 'Erro ao excluir transação'))
      }
      commit(transactions.filter((item) => item.id !== id))
    },
    [transactions, commit],
  )

  const updateTransaction = useCallback(
    async (id: string, transaction: Transaction) => {
      try {
        const updated = await updateTransactionRemote(id, toPayload(transaction))
        commit(transactions.map((item) => (item.id === id ? updated : item)))
        setError(null)
      } catch (err) {
        commit(transactions.map((item) => (item.id === id ? transaction : item)))
        setError(errorMessage(err, 'Erro ao atualizar transação'))
      }
    },
    [transactions, commit],
  )

  const value = useMemo(
    () => ({
      transactions,
      isLoading,
      error,
      paginationMeta,
      loadTransactions,
      addTransaction,
      removeTransaction,
      updateTransaction,
    }),
    [transactions, isLoading, error, paginationMeta, loadTransactions, addTransaction, removeTransaction, updateTransaction],
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}
