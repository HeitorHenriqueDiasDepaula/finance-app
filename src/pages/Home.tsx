import { useMemo } from 'react'
import CategoryChart from '../components/CategoryChart'
import FinanceChart from '../components/FinanceChart'
import TransactionForm from '../components/TransactionForm'
import { useFinance } from '../context/useFinance'
import { formatCurrency, getFinanceSummary } from '../services/financeSummary'
import type { Transaction } from '../types/Transaction'

export function Home() {
  const { transactions, isLoading, error } = useFinance()

  const summary = useMemo(() => getFinanceSummary(transactions), [transactions])

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-[#1E3A5F]">📊 Dashboard Financeiro</h1>
        <p className="text-sm text-gray-500 mt-1">Resumo rápido das suas entradas, saídas e saldo.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-emerald-50 p-4">
          <strong className="text-sm text-emerald-700">Entradas</strong>
          <p className="text-lg font-semibold text-emerald-600">{formatCurrency(summary.income)}</p>
        </div>

        <div className="rounded-2xl bg-rose-50 p-4">
          <strong className="text-sm text-rose-700">Saídas</strong>
          <p className="text-lg font-semibold text-rose-600">{formatCurrency(summary.expense)}</p>
        </div>

        <div className="rounded-2xl bg-indigo-50 p-4">
          <strong className="text-sm text-indigo-700">Saldo</strong>
          <p className={`text-lg font-semibold ${summary.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(summary.balance)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <FinanceChart transactions={transactions} />
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <CategoryChart transactions={transactions} />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1E3A5F]">Nova transação</h2>
        <TransactionForm className="mt-3" />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1E3A5F]">🧾 Transações</h2>

        {isLoading ? (
          <p className="mt-2 text-sm text-gray-500">Carregando transações...</p>
        ) : error ? (
          <p className="mt-2 text-sm text-rose-600">{error}</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-gray-500 mt-2">Nenhuma transação cadastrada</p>
        ) : null}

        <div className="mt-3 space-y-2">
          {transactions.map((transaction: Transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-3"
            >
              <div>
                <p className="font-medium text-gray-700">{transaction.description}</p>
                <p className="text-xs text-gray-400">{transaction.category} • {transaction.date}</p>
              </div>
              <span className={transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}>
                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
