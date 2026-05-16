import { Link } from 'react-router-dom'
import { useFinance } from '../context/FinanceContext'
import type { Transaction } from '../types/Transaction'
import './home.css'

export function Home() {
  const { transactions } = useFinance()

  const totalIncome = transactions
    .filter((t: Transaction) => t.type === 'income')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter((t: Transaction) => t.type === 'expense')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  const recentTransactions = [...transactions].slice(0, 5)

  return (
    <main className="home-page">
      <section className="hero">
        <h1>Bem-vindo ao Finance App</h1>
        <p>
          Organize seus gastos, acompanhe sua evolução financeira e feche o mês
          com mais clareza.
        </p>
        <Link to="/monthly" className="hero-button">
          Ver fechamento mensal
        </Link>
      </section>

      <section className="cards" aria-label="Resumo financeiro">
        <article className="card income">
          <span>Entradas</span>
          <strong>R$ {totalIncome.toFixed(2)}</strong>
        </article>

        <article className="card expense">
          <span>Saídas</span>
          <strong>R$ {totalExpense.toFixed(2)}</strong>
        </article>

        <article className="card total">
          <span>Saldo</span>
          <strong className={balance >= 0 ? 'positive' : 'negative'}>
            R$ {balance.toFixed(2)}
          </strong>
        </article>
      </section>

      <section className="recent-transactions">
        <h2>Últimas transações</h2>

        {transactions.length === 0 ? (
          <p className="empty-state">Nenhuma transação cadastrada ainda.</p>
        ) : (
          <ul className="transactions">
            {recentTransactions.map((t: Transaction) => (
              <li key={t.id} className={t.type}>
                <span>{t.description}</span>
                <span>
                  {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
