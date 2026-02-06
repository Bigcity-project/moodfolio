'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { StockIndicatorsDto } from '@/lib/api-client'

interface StockIndicatorsProps {
  symbol: string
  name: string
  indicators: StockIndicatorsDto
}

function formatNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`
  }
  if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`
  }
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  return value.toLocaleString()
}

function formatVolume(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`
  }
  return value.toLocaleString()
}

export function StockIndicators({ symbol, name, indicators }: StockIndicatorsProps) {
  const isPositive = indicators.change >= 0
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card glass className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-slate-900 dark:text-white">{symbol}</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">{name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              ${indicators.price.toFixed(2)}
            </p>
            <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              <ChangeIcon className="w-4 h-4" />
              <span className="text-sm font-semibold tabular-nums">
                {isPositive ? '+' : ''}{indicators.change.toFixed(2)} ({isPositive ? '+' : ''}{indicators.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <IndicatorCell label="Volume" value={formatVolume(indicators.volume)} />
          <IndicatorCell
            label="Market Cap"
            value={indicators.marketCap ? formatNumber(indicators.marketCap) : 'N/A'}
          />
          <IndicatorCell
            label="P/E Ratio"
            value={indicators.trailingPE ? indicators.trailingPE.toFixed(2) : 'N/A'}
          />
          <IndicatorCell
            label="52W Range"
            value={`$${indicators.fiftyTwoWeekLow.toFixed(0)} - $${indicators.fiftyTwoWeekHigh.toFixed(0)}`}
          />
          <IndicatorCell
            label="Day Range"
            value={`$${indicators.dayLow.toFixed(2)} - $${indicators.dayHigh.toFixed(2)}`}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function IndicatorCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{value}</p>
    </div>
  )
}
