// Cores dos gráficos (paleta validada: contraste, separação para daltonismo e luminosidade).
// A cor acompanha a entidade em todos os gráficos: entradas = azul, saídas = laranja.
export const CHART_COLORS = {
  income: '#2a78d6',
  expense: '#eb6834',
  grid: '#e5e7eb',
  axis: '#6b7280',
  text: '#374151',
} as const

/** Valores compactos nos eixos: 1.5K, 2M */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}
