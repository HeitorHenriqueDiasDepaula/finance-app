import type { Transaction } from '../types/Transaction'

const STORAGE_KEY = '@finance-app:transactions'

function readTransactions(): Transaction[] {
  if (typeof window === 'undefined') {
    return []
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function writeTransactions(transactions: Transaction[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
}

export function getTransactions(): Transaction[] {
  return readTransactions()
}

export function saveTransactions(transactions: Transaction[]) {
  writeTransactions(transactions)
}

export function addTransaction(transaction: Transaction) {
  const transactions = [transaction, ...readTransactions()]
  writeTransactions(transactions)
  return transactions
}

export function removeTransaction(id: string) {
  const transactions = readTransactions().filter((transaction) => transaction.id !== id)
  writeTransactions(transactions)
  return transactions
}

export function updateTransaction(id: string, updatedTransaction: Transaction) {
  const transactions = readTransactions().map((transaction) =>
    transaction.id === id ? updatedTransaction : transaction
  )
  writeTransactions(transactions)
  return transactions
}

export function getBalance() {
  const transactions = getTransactions()

  return transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === 'income') {
        acc.income += transaction.amount
        acc.total += transaction.amount
      } else {
        acc.expense += transaction.amount
        acc.total -= transaction.amount
      }
      return acc
    },
    { income: 0, expense: 0, total: 0 }
  )
}
