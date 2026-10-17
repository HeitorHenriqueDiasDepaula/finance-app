import { useContext } from 'react'
import { FinanceContext, type FinanceContextData } from './financeContext'

export function useFinance(): FinanceContextData {
  const context = useContext(FinanceContext)

  if (!context) {
    throw new Error('useFinance deve ser usado dentro de um FinanceProvider')
  }

  return context
}
