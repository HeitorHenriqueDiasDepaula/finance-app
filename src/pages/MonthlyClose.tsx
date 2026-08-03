import { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, getFinanceSummary } from '../services/financeSummary';

export default function MonthlyClose() {
  const { transactions, isLoading, error } = useFinance();
  const summary = useMemo(() => getFinanceSummary(transactions), [transactions]);

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-[#1E3A5F]">Resumo Financeiro</h1>
        <p className="text-sm text-gray-500 mt-1">Visão consolidada das suas transações.</p>
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

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1E3A5F]">Transações</h2>

        {isLoading ? (
          <p className="mt-2 text-sm text-gray-500">Carregando transações...</p>
        ) : error ? (
          <p className="mt-2 text-sm text-rose-600">{error}</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-gray-500 mt-2">Nenhuma transação cadastrada</p>
        ) : null}

        <div className="mt-3 overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Descrição</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-t border-gray-100">
                  <td className="p-3">{transaction.description}</td>
                  <td className="p-3">{transaction.type === 'income' ? 'Entrada' : 'Saída'}</td>
                  <td className="p-3">{transaction.category}</td>
                  <td className={`p-3 font-medium ${transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="p-3">{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
