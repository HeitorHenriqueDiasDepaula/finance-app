import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { Home } from './pages/Home'
import MonthlyClose from './pages/MonthlyClose'
import Transactions from './pages/Transactions'
import TransactionDetails from './pages/TransactionDetails'
import Upload from './pages/Upload'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transactions/:id" element={<TransactionDetails />} />
        <Route path="/monthly-close" element={<MonthlyClose />} />
        <Route path="/monthly" element={<Navigate to="/monthly-close" replace />} />
      </Route>
    </Routes>
  )
}
