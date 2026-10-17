import { useState, type FormEvent } from 'react'
import { useFinance } from '../context/useFinance'
import type { Transaction } from '../types/Transaction'

interface TransactionFormProps {
  className?: string
  mode?: 'create' | 'edit'
  initialValues?: Transaction
  submitLabel?: string
  onSuccess?: () => void
}

export default function TransactionForm({
  className = '',
  mode = 'create',
  initialValues,
  submitLabel = 'Cadastrar transação',
  onSuccess,
}: TransactionFormProps) {
  const { addTransaction, updateTransaction } = useFinance()

  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [amount, setAmount] = useState(initialValues ? String(initialValues.amount) : '')
  const [type, setType] = useState<'income' | 'expense'>(initialValues?.type ?? 'income')
  const [category, setCategory] = useState(initialValues?.category ?? '')
  const [date, setDate] = useState(initialValues?.date ?? '')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const numericAmount = Number(amount)
    if (!description || !category || !date || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return
    }

    if (mode === 'edit' && initialValues) {
      updateTransaction(initialValues.id, {
        ...initialValues,
        description,
        amount: numericAmount,
        type,
        category,
        date,
      })
    } else {
      addTransaction({
        id: crypto.randomUUID(),
        description,
        amount: numericAmount,
        type,
        category,
        date,
      })
    }

    if (mode !== 'edit') {
      setDescription('')
      setAmount('')
      setCategory('')
      setDate('')
      setType('income')
    }

    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${className}`.trim()}>
      <input
        type="text"
        placeholder="Descrição"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        className="border border-gray-200 rounded-xl p-3"
        required
      />

      <input
        type="number"
        placeholder="Valor"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        className="border border-gray-200 rounded-xl p-3"
        min="0"
        step="0.01"
        required
      />

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Categoria"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="border border-gray-200 rounded-xl p-3 flex-1 min-w-0"
          required
        />

        <input
          id="date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="border border-gray-200 rounded-xl p-3"
          required
        />
      </div>

      <select
        value={type}
        onChange={(event) => setType(event.target.value as 'income' | 'expense')}
        className="border border-gray-200 rounded-xl p-3"
      >
        <option value="income">Receita</option>
        <option value="expense">Despesa</option>
      </select>

      <button type="submit" className="bg-[#1E3A5F] text-white rounded-xl p-3 font-medium">
        {submitLabel}
      </button>
    </form>
  )
}
