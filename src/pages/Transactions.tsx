import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TransactionForm from '../components/TransactionForm'
import { useFinance } from '../context/useFinance'
import { formatCurrency } from '../services/financeSummary'

export default function Transactions() {
  const { transactions, removeTransaction, isLoading, error, loadTransactions, paginationMeta } = useFinance()
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [page, setPage] = useState(1)
  const limit = 5

  useEffect(() => {
    void loadTransactions(1, 100)
  }, [loadTransactions])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesCategory = categoryFilter
        ? transaction.category.toLowerCase().includes(categoryFilter.toLowerCase())
        : true
      const matchesDate = dateFilter ? transaction.date === dateFilter : true
      return matchesCategory && matchesDate
    })
  }, [transactions, categoryFilter, dateFilter])

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / limit))
  const currentPage = Math.min(page, totalPages)
  const pagedTransactions = filteredTransactions.slice((currentPage - 1) * limit, currentPage * limit)

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-medium text-gray-500">Adicionar Transação</h2>
        <TransactionForm className="mt-3" />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500">Transações Recentes</h2>
          <span className="text-xs text-gray-400">{paginationMeta?.totalItems ?? filteredTransactions.length} itens</span>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            type="text"
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value)
              setPage(1)
            }}
            placeholder="Filtrar por categoria"
            className="rounded-xl border border-gray-200 p-2"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => {
              setDateFilter(event.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-gray-200 p-2"
          />
        </div>

        {isLoading ? (
          <p className="mt-4 text-sm text-gray-500">Carregando transações...</p>
        ) : error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <p>{error}</p>
            <button type="button" onClick={() => void loadTransactions(1, 100)} className="mt-2 font-medium">
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            <ul className="mt-3 divide-y divide-gray-100">
              {pagedTransactions.map((transaction) => (
                <li key={transaction.id} className="flex items-center justify-between gap-3 py-3">
                  <Link to={`/transactions/${transaction.id}`} className="min-w-0 flex-1">
                    <p className="font-medium text-gray-700">{transaction.description}</p>
                    <p className="text-xs text-gray-400">{transaction.category} • {transaction.date}</p>
                  </Link>

                  <div className="flex items-center gap-2">
                    <span className={transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}>
                      {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => void removeTransaction(transaction.id)}
                      className="rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-500"
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-200 px-3 py-1 disabled:opacity-50"
              >
                Anterior
              </button>
              <span>Página {currentPage} de {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1 disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
