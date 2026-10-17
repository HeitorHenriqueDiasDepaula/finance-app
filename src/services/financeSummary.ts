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

// ---------- Agrupamentos por mês e categoria ----------

/** Chave de mês no formato AAAA-MM, extraída direto da string (evita problemas de fuso). */
export function getMonthKey(date: string): string {
  return date.slice(0, 7)
}

/** Meses que possuem transações, do mais recente para o mais antigo. */
export function getAvailableMonths(transactions: Transaction[]): string[] {
  const months = new Set(transactions.map((transaction) => getMonthKey(transaction.date)))
  return [...months].filter((month) => /^\d{4}-\d{2}$/.test(month)).sort().reverse()
}

export function filterByMonth(transactions: Transaction[], monthKey: string): Transaction[] {
  return transactions.filter((transaction) => getMonthKey(transaction.date) === monthKey)
}

/** Mês imediatamente anterior ("2026-01" -> "2025-12"). */
export function getPreviousMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  return month === 1
    ? `${year - 1}-12`
    : `${year}-${String(month - 1).padStart(2, '0')}`
}

const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

/** "2026-08" -> "agosto de 2026" */
export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  return `${MONTH_NAMES[month - 1] ?? monthKey} de ${year}`
}

export interface CategoryTotal {
  category: string
  total: number
}

/**
 * Total por categoria de um tipo (entrada ou saída), do maior para o menor.
 * Passando `maxItems`, o excedente é somado em "Outras".
 */
export function getCategoryTotals(
  transactions: Transaction[],
  type: Transaction['type'],
  maxItems?: number,
): CategoryTotal[] {
  const totals = new Map<string, number>()

  for (const transaction of transactions) {
    if (transaction.type !== type) continue
    const category = transaction.category.trim() || 'Sem categoria'
    totals.set(category, (totals.get(category) ?? 0) + transaction.amount)
  }

  const sorted = [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)

  if (!maxItems || sorted.length <= maxItems) {
    return sorted
  }

  const top = sorted.slice(0, maxItems - 1)
  const others = sorted.slice(maxItems - 1).reduce((sum, item) => sum + item.total, 0)
  return [...top, { category: 'Outras', total: others }]
}

// ---------- Comparação entre meses ----------

export interface MetricChange {
  current: number
  previous: number
  /** current - previous */
  difference: number
  /** Variação percentual; null quando o mês anterior é zero (não há base de comparação). */
  percent: number | null
}

export function getChange(current: number, previous: number): MetricChange {
  return {
    current,
    previous,
    difference: current - previous,
    percent: previous === 0 ? null : ((current - previous) / Math.abs(previous)) * 100,
  }
}

export interface MonthComparison {
  income: MetricChange
  expense: MetricChange
  balance: MetricChange
  /** false quando o mês anterior não tem nenhuma transação */
  hasPrevious: boolean
}

export function compareMonths(
  transactions: Transaction[],
  monthKey: string,
): MonthComparison {
  const currentTransactions = filterByMonth(transactions, monthKey)
  const previousTransactions = filterByMonth(transactions, getPreviousMonthKey(monthKey))
  const current = getFinanceSummary(currentTransactions)
  const previous = getFinanceSummary(previousTransactions)

  return {
    income: getChange(current.income, previous.income),
    expense: getChange(current.expense, previous.expense),
    balance: getChange(current.balance, previous.balance),
    hasPrevious: previousTransactions.length > 0,
  }
}

/** Formata a variação percentual: "+12,5%", "-8,0%" ou "—" quando não há base. */
export function formatPercent(percent: number | null): string {
  if (percent === null) return '—'
  const sign = percent > 0 ? '+' : ''
  return `${sign}${percent.toFixed(1).replace('.', ',')}%`
}
