import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TransactionForm from '../components/TransactionForm'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency } from '../services/financeSummary'

export default function TransactionDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { transactions, removeTransaction } = useFinance()
  const [isEditing, setIsEditing] = useState(false)

  const transaction = transactions.find((item) => item.id === id)

  useEffect(() => {
    setIsEditing(false)
  }, [id])

  if (!transaction) {
    return (
      <div className="p-4 space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h1 className="text-xl font-semibold text-[#1E3A5F]">Transação não encontrada</h1>
          <p className="text-sm text-gray-500 mt-2">A transação solicitada não existe ou já foi removida.</p>
          <Link to="/transactions" className="mt-4 inline-flex text-sm text-[#1E3A5F]">
            Voltar para transações
          </Link>
        </div>
      </div>
    )
  }

  async function handleRemove() {
    await removeTransaction(transaction.id)
    navigate('/transactions')
  }

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold text-[#1E3A5F]">Detalhes da transação</h1>
            <p className="text-sm text-gray-500 mt-1">Visualize e edite os dados da transação.</p>
          </div>
          <Link to="/transactions" className="text-sm text-[#1E3A5F]">
            Voltar
          </Link>
        </div>
      </div>

      {!isEditing ? (
        <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Descrição</p>
              <p className="font-semibold text-gray-700">{transaction.description}</p>
            </div>
            <span className={transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}>
              {transaction.type === 'income' ? 'Receita' : 'Despesa'}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Valor</p>
              <p className="font-semibold text-gray-700">{formatCurrency(transaction.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Categoria</p>
              <p className="font-semibold text-gray-700">{transaction.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data</p>
              <p className="font-semibold text-gray-700">{transaction.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ID</p>
              <p className="font-semibold text-gray-700">{transaction.id}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-xl bg-[#1E3A5F] px-3 py-2 text-sm text-white"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600"
            >
              Excluir
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1E3A5F]">Editar transação</h2>
            <button type="button" onClick={() => setIsEditing(false)} className="text-sm text-gray-500">
              Cancelar
            </button>
          </div>
          <TransactionForm
            mode="edit"
            initialValues={transaction}
            submitLabel="Salvar alterações"
            onSuccess={() => setIsEditing(false)}
          />
        </div>
      )}
    </div>
  )
}
