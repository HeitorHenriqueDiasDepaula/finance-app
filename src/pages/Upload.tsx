import TransactionForm from '../components/TransactionForm'

export default function Upload() {
  return (
    <div className="p-4 space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-[#1E3A5F]">Upload</h1>
        <p className="text-gray-500 mt-2">Adicionar entradas e saídas manualmente.</p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <TransactionForm />
      </div>
    </div>
  )
}
