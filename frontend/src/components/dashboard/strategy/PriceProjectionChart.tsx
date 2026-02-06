'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n/context'

interface PriceProjectionChartProps {
  currentPrice: number
  projectedPrice: number
  breakEven: number
  low52: number
  high52: number
  onProjectedPriceChange: (price: number) => void
  stance: 'bullish' | 'bearish'
}

const CHART_WIDTH = 800
const CHART_HEIGHT = 400
const PADDING = { top: 40, right: 80, bottom: 60, left: 80 }
const PLOT_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right
const PLOT_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom

export function PriceProjectionChart({
  currentPrice,
  projectedPrice,
  breakEven,
  low52,
  high52,
  onProjectedPriceChange,
  stance,
}: PriceProjectionChartProps) {
  const { t } = useTranslation()
  const svgRef = useRef<SVGSVGElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Price range with 10% buffer
  const range = high52 - low52
  const minPrice = Math.max(0, low52 - range * 0.1)
  const maxPrice = high52 + range * 0.1

  function priceToY(price: number): number {
    return PADDING.top + PLOT_HEIGHT - ((price - minPrice) / (maxPrice - minPrice)) * PLOT_HEIGHT
  }

  function yToPrice(y: number): number {
    const normalized = (PADDING.top + PLOT_HEIGHT - y) / PLOT_HEIGHT
    return minPrice + normalized * (maxPrice - minPrice)
  }

  const handlePointerDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!isDragging || !svgRef.current) return

      const rect = svgRef.current.getBoundingClientRect()
      const scaleY = CHART_HEIGHT / rect.height
      const clientY = (e.clientY - rect.top) * scaleY

      const newPrice = yToPrice(clientY)
      const clamped = Math.max(minPrice, Math.min(maxPrice, newPrice))
      onProjectedPriceChange(Math.round(clamped * 100) / 100)
    },
    [isDragging, minPrice, maxPrice, onProjectedPriceChange]
  )

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      const handleUp = () => setIsDragging(false)
      window.addEventListener('pointerup', handleUp)
      return () => window.removeEventListener('pointerup', handleUp)
    }
  }, [isDragging])

  const currentY = priceToY(currentPrice)
  const projectedY = priceToY(projectedPrice)
  const breakEvenY = priceToY(breakEven)
  const isProfitable = stance === 'bullish' ? projectedPrice > breakEven : projectedPrice < breakEven

  // Bezier control points
  const startX = PADDING.left
  const endX = PADDING.left + PLOT_WIDTH
  const midX = (startX + endX) / 2
  const curvePath = `M ${startX} ${currentY} C ${midX} ${currentY}, ${midX} ${projectedY}, ${endX} ${projectedY}`

  // Profit/loss shaded area
  const profitAreaPath = isProfitable
    ? `M ${startX} ${currentY} C ${midX} ${currentY}, ${midX} ${projectedY}, ${endX} ${projectedY} L ${endX} ${currentY} Z`
    : `M ${startX} ${currentY} C ${midX} ${currentY}, ${midX} ${projectedY}, ${endX} ${projectedY} L ${endX} ${currentY} Z`

  // Price grid lines
  const gridPrices = generateGridPrices(minPrice, maxPrice, 5)

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      className="w-full max-w-[800px] select-none touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Grid lines */}
      {gridPrices.map((price) => {
        const y = priceToY(price)
        return (
          <g key={price}>
            <line
              x1={PADDING.left} y1={y}
              x2={PADDING.left + PLOT_WIDTH} y2={y}
              stroke="rgba(255,255,255,0.06)" strokeWidth="1"
            />
            <text
              x={PADDING.left - 10} y={y + 4}
              textAnchor="end"
              className="fill-white/50 text-[10px]"
            >
              ${price.toFixed(0)}
            </text>
          </g>
        )
      })}

      {/* Profit/Loss area */}
      <path
        d={profitAreaPath}
        fill={isProfitable ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
      />

      {/* Projection curve */}
      <path
        d={curvePath}
        fill="none"
        stroke={isProfitable ? '#22c55e' : '#ef4444'}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Current price line */}
      <line
        x1={PADDING.left} y1={currentY}
        x2={PADDING.left + PLOT_WIDTH} y2={currentY}
        stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="6 4"
      />
      <text
        x={PADDING.left + PLOT_WIDTH + 8} y={currentY + 4}
        className="fill-white/50 text-[11px] font-semibold"
      >
        ${currentPrice.toFixed(2)}
      </text>
      <text
        x={PADDING.left - 10} y={currentY - 8}
        textAnchor="end"
        className="fill-white/50 text-[9px]"
      >
        {t('chart.current')}
      </text>

      {/* Break-even line */}
      <line
        x1={PADDING.left} y1={breakEvenY}
        x2={PADDING.left + PLOT_WIDTH} y2={breakEvenY}
        stroke="rgba(251, 191, 36, 0.4)" strokeWidth="1" strokeDasharray="4 4"
      />
      <text
        x={PADDING.left + PLOT_WIDTH + 8} y={breakEvenY + 4}
        className="fill-amber-400/60 text-[10px]"
      >
        {t('chart.breakEven')} ${breakEven.toFixed(2)}
      </text>

      {/* Current price dot */}
      <circle
        cx={startX} cy={currentY}
        r="5" fill="white" stroke="rgba(255,255,255,0.3)" strokeWidth="2"
      />

      {/* Projected price draggable endpoint */}
      <g
        onPointerDown={handlePointerDown}
        className="cursor-ns-resize"
      >
        <circle
          cx={endX} cy={projectedY}
          r="20" fill="transparent"
        />
        <circle
          cx={endX} cy={projectedY}
          r="8"
          fill={isProfitable ? '#22c55e' : '#ef4444'}
          stroke="white" strokeWidth="2"
          className={isDragging ? 'opacity-100' : 'opacity-80'}
        />
        <text
          x={endX} y={projectedY - 16}
          textAnchor="middle"
          className={`text-[12px] font-bold ${isProfitable ? 'fill-green-400' : 'fill-red-400'}`}
        >
          ${projectedPrice.toFixed(2)}
        </text>
        <text
          x={endX} y={projectedY + 24}
          textAnchor="middle"
          className="fill-white/50 text-[9px]"
        >
          {t('chart.dragToAdjust')}
        </text>
      </g>

      {/* Time labels */}
      <text x={startX} y={CHART_HEIGHT - 15} textAnchor="middle" className="fill-white/50 text-[10px]">
        {t('chart.today')}
      </text>
      <text x={endX} y={CHART_HEIGHT - 15} textAnchor="middle" className="fill-white/50 text-[10px]">
        {t('chart.target')}
      </text>
    </svg>
  )
}

function generateGridPrices(min: number, max: number, count: number): number[] {
  const step = (max - min) / (count + 1)
  return Array.from({ length: count }, (_, i) => min + step * (i + 1))
}
