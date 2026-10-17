import { useMemo, useState } from 'react'
import CategoryChart from '../components/CategoryChart'
import FinanceChart from '../components/FinanceChart'
import { useFinance } from '../context/useFinance'
import {
  compareMonths,
  filterByMonth,
  formatCurrency,
  formatMonthLabel,
  formatPercent,
  getAvailableMonths,
  getFinanceSummary,
  getPreviousMonthKey,
  type MetricChange,
} from '../services/financeSummary'

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

interface ChangeBadgeProps {
  change: MetricChange
  /** Se um aumento é bom (entradas, saldo) ou ruim (saídas) */
  increaseIsGood: boolean
  previousLabel: string
  hasPrevious: boolean
}

function ChangeBadge({ change, increaseIsGood, previousLabel, hasPrevious }: ChangeBadgeProps) {
  if (!hasPrevious) {
    return <p className="mt-1 text-xs text-gray-500">Sem dados em {previousLabel}</p>
  }

  if (change.difference === 0) {
    return <p className="mt-1 text-xs text-gray-500">= Igual a {previousLabel}</p>
  }

  const increased = change.difference > 0
  const isGood = increased === increaseIsGood
  const color = isGood ? 'text-emerald-700' : 'text-rose-700'
  const sign = increased ? '+' : '-'

  return (
    <p className={`mt-1 text-xs font-medium ${color}`}>
      <span aria-hidden="true">{increased ? '▲' : '▼'} </span>
      {change.percent === null ? '' : `${formatPercent(change.percent)} · `}
      {sign}{formatCurrency(Math.abs(change.difference))}
      <span className="font-normal text-gray-500"> vs. {previousLabel}</span>
    </p>
  )
}

export default function MonthlyClose() {
  const { transactions, isLoading, error } = useFinance()
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  const months = useMemo(() => getAvailableMonths(transactions), [transactions])
  // Sem escolha (ou escolha que sumiu da lista), usa o mês mais recente com dados
  const month = selectedMonth && months.includes(selectedMonth) ? selectedMonth : months[0]

  const monthTransactions = useMemo(
    () => (month ? filterByMonth(transactions, month) : []),
    [transactions, month],
  )
  const summary = useMemo(() => getFinanceSummary(monthTransactions), [monthTransactions])
  const comparison = useMemo(() => (month ? compareMonths(transactions, month) : null), [transactions, month])
  const sortedTransactions = useMemo(
    () => [...monthTransactions].sort((a, b) => b.date.localeCompare(a.date)),
    [monthTransactions],
  )

  const previousLabel = month ? formatMonthLabel(getPreviousMonthKey(month)) : ''

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-[#1E3A5F]">Fechamento Mensal</h1>
        <p className="text-sm text-gray-500 mt-1">Resultado do mês e comparação com o mês anterior.</p>

        {months.length > 0 && (
          <div className="mt-3">
            <label htmlFor="month" className="block text-sm text-gray-500">
              Mês
            </label>
            <select
              id="month"
              value={month}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 p-3 sm:w-64"
            >
              {months.map((option) => (
                <option key={option} value={option}>
                  {capitalizeFirst(formatMonthLabel(option))}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Carregando transações...</p>
      ) : error ? (
        <p className="text-sm text-rose-600">{error}</p>
      ) : null}

      {!isLoading && months.length === 0 ? (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Nenhuma transação cadastrada para fechar um mês.</p>
        </div>
      ) : (
        month &&
        comparison && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <strong className="text-sm text-emerald-700">Entradas</strong>
                <p className="text-lg font-semibold text-emerald-600">{formatCurrency(summary.income)}</p>
                <ChangeBadge
                  change={comparison.income}
                  increaseIsGood
                  previousLabel={previousLabel}
                  hasPrevious={comparison.hasPrevious}
                />
              </div>

              <div className="rounded-2xl bg-rose-50 p-4">
                <strong className="text-sm text-rose-700">Saídas</strong>
                <p className="text-lg font-semibold text-rose-600">{formatCurrency(summary.expense)}</p>
                <ChangeBadge
                  change={comparison.expense}
                  increaseIsGood={false}
                  previousLabel={previousLabel}
                  hasPrevious={comparison.hasPrevious}
                />
              </div>

              <div className="rounded-2xl bg-indigo-50 p-4">
                <strong className="text-sm text-indigo-700">Saldo</strong>
                <p className={`text-lg font-semibold ${summary.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrency(summary.balance)}
                </p>
                <ChangeBadge
                  change={comparison.balance}
                  increaseIsGood
                  previousLabel={previousLabel}
                  hasPrevious={comparison.hasPrevious}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <FinanceChart transactions={monthTransactions} title={`Entradas x Saídas · ${formatMonthLabel(month)}`} />
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <CategoryChart transactions={monthTransactions} title={`Saídas por categoria · ${formatMonthLabel(month)}`} />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-[#1E3A5F]">
                Transações · {summary.totalTransactions}
              </h2>

              <div className="mt-3 overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="p-2 sm:p-3">Descrição</th>
                      <th className="hidden p-3 sm:table-cell">Tipo</th>
                      <th className="p-2 sm:p-3">Categoria</th>
                      <th className="p-2 sm:p-3">Valor</th>
                      <th className="p-2 sm:p-3">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-t border-gray-100">
                        <td className="p-2 sm:p-3">{transaction.description}</td>
                        <td className="hidden p-3 sm:table-cell">{transaction.type === 'income' ? 'Entrada' : 'Saída'}</td>
                        <td className="p-2 sm:p-3">{transaction.category}</td>
                        <td className={`whitespace-nowrap p-2 font-medium sm:p-3 ${transaction.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </td>
                        <td className="whitespace-nowrap p-2 sm:p-3">{transaction.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )
      )}
    </div>
  )
}
