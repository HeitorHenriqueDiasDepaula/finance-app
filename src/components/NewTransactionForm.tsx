import { useState } from "react"
import { useFinance } from "../context/useFinance"

export function NewTransactionForm() {
  const { addTransaction } = useFinance()

  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState<number>(0)
  const [type, setType] = useState<"income" | "expense">("income")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    addTransaction({
      id: crypto.randomUUID(), // 🔥 ID GERADO AQUI
      description,
      amount,
      type,
      category,
      date
    })

    // limpar formulário
    setDescription("")
    setAmount(0)
    setCategory("")
    setDate("")
    setType("income")
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Descrição"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Valor"
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
        required
      />

      <label htmlFor="type">Tipo</label>
      <select
        id="type"
        value={type}
        onChange={e => setType(e.target.value as "income" | "expense")}
      >
        <option value="income">Entrada</option>
        <option value="expense">Saída</option>
      </select>

      <input
        type="text"
        placeholder="Categoria"
        value={category}
        onChange={e => setCategory(e.target.value)}
        required
      />

      <label htmlFor="date">Data</label>
      <input
        id="date"
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        required
      />

      <button type="submit">Cadastrar</button>
    </form>
  )
}
