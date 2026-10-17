import { formatCurrency } from '../services/financeSummary'

interface TooltipPayloadItem {
  value?: number | string
  payload?: { name?: string; category?: string }
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  /** Nome exibido quando o dado não traz `name` nem `category` */
  fallbackLabel?: string
}

export default function ChartTooltip({ active, payload, fallbackLabel }: ChartTooltipProps) {
  const item = payload?.[0]
  if (!active || !item) return null

  const label = item.payload?.name ?? item.payload?.category ?? fallbackLabel ?? ''

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-md">
      <p className="text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800">{formatCurrency(Number(item.value ?? 0))}</p>
    </div>
  )
}
