import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Transaction } from '../types/Transaction'
import { formatCurrency, getFinanceSummary } from '../services/financeSummary'
import ChartTooltip from './ChartTooltip'
import { CHART_COLORS, formatCompact } from './chartTheme'

interface FinanceChartProps {
  transactions: Transaction[]
  title?: string
}

export default function FinanceChart({ transactions, title = 'Entradas x Saídas' }: FinanceChartProps) {
  const { income, expense } = getFinanceSummary(transactions)

  const data = [
    { name: 'Entradas', value: income, color: CHART_COLORS.income },
    { name: 'Saídas', value: expense, color: CHART_COLORS.expense },
  ]

  return (
    <figure className="m-0">
      <figcaption className="text-lg font-semibold text-[#1E3A5F]">{title}</figcaption>

      {transactions.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">Sem dados para exibir.</p>
      ) : (
        <>
          <div
            className="mt-3 h-56 w-full"
            role="img"
            aria-label={`${title}: entradas ${formatCurrency(income)}, saídas ${formatCurrency(expense)}`}
          >
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 224 }}>
              <BarChart data={data} margin={{ top: 24, right: 8, bottom: 0, left: 0 }} barCategoryGap="30%">
                <XAxis
                  dataKey="name"
                  axisLine={{ stroke: CHART_COLORS.grid }}
                  tickLine={false}
                  tick={{ fill: CHART_COLORS.text, fontSize: 13 }}
                />
                <YAxis
                  width={44}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatCompact}
                  tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
                />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} content={<ChartTooltip />} />
                <Bar dataKey="value" maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="top"
                    formatter={(value) => formatCurrency(Number(value))}
                    fill={CHART_COLORS.text}
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <table className="sr-only">
            <caption>{title}</caption>
            <tbody>
              {data.map((entry) => (
                <tr key={entry.name}>
                  <th scope="row">{entry.name}</th>
                  <td>{formatCurrency(entry.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </figure>
  )
}
