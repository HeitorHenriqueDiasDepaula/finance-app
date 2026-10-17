import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Transaction } from '../types/Transaction'
import { formatCurrency, getCategoryTotals } from '../services/financeSummary'
import ChartTooltip from './ChartTooltip'
import { CHART_COLORS } from './chartTheme'

interface CategoryChartProps {
  transactions: Transaction[]
  title?: string
  /** Quantidade máxima de barras; o excedente vira "Outras" */
  maxItems?: number
}

const ROW_HEIGHT = 40

export default function CategoryChart({
  transactions,
  title = 'Saídas por categoria',
  maxItems = 6,
}: CategoryChartProps) {
  const data = getCategoryTotals(transactions, 'expense', maxItems)
  const total = data.reduce((sum, item) => sum + item.total, 0)

  return (
    <figure className="m-0">
      <figcaption className="text-lg font-semibold text-[#1E3A5F]">{title}</figcaption>

      {data.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">Nenhuma saída no período.</p>
      ) : (
        <>
          <div
            className="mt-3 w-full"
            style={{ height: data.length * ROW_HEIGHT + 16 }}
            role="img"
            aria-label={`${title}: ${data
              .map((item) => `${item.category} ${formatCurrency(item.total)}`)
              .join(', ')}`}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
              initialDimension={{ width: 320, height: data.length * ROW_HEIGHT + 16 }}
            >
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 84, bottom: 0, left: 0 }}
                barCategoryGap="30%"
              >
                <XAxis type="number" hide domain={[0, 'dataMax']} />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={96}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: CHART_COLORS.text, fontSize: 13 }}
                />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} content={<ChartTooltip />} />
                <Bar
                  dataKey="total"
                  fill={CHART_COLORS.expense}
                  maxBarSize={20}
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="total"
                    position="right"
                    formatter={(value) => formatCurrency(Number(value))}
                    fill={CHART_COLORS.text}
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-2 text-xs text-gray-400">Total de saídas: {formatCurrency(total)}</p>
        </>
      )}
    </figure>
  )
}
