import type { Transaction } from '../types/Transaction'

export interface FinanceSummary {
  income: number
  expense: number
  balance: number
  totalTransactions: number
}

export function getFinanceSummary(transactions: Transaction[]): FinanceSummary {
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const expense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  return {
    income,
    expense,
    balance: income - expense,
    totalTransactions: transactions.length,
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
