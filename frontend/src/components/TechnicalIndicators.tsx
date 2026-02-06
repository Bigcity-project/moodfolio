'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import type { TechnicalIndicatorsDto } from '@/lib/api-client'

interface TechnicalIndicatorsProps {
  technicals: TechnicalIndicatorsDto
}

function getRsiColor(rsi: number): string {
  if (rsi >= 70) return 'text-red-600 dark:text-red-400'
  if (rsi <= 30) return 'text-green-600 dark:text-green-400'
  return 'text-slate-700 dark:text-slate-200'
}

function getRsiLabel(rsi: number): string {
  if (rsi >= 70) return 'Overbought'
  if (rsi <= 30) return 'Oversold'
  return 'Neutral'
}

function getRsiBgColor(rsi: number): string {
  if (rsi >= 70) return 'bg-red-100 dark:bg-red-900/30'
  if (rsi <= 30) return 'bg-green-100 dark:bg-green-900/30'
  return 'bg-slate-100 dark:bg-slate-800'
}

export function TechnicalIndicators({ technicals }: TechnicalIndicatorsProps) {
  return (
    <Card glass className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <CardTitle className="text-lg text-slate-900 dark:text-white">Technical Indicators</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* RSI */}
        {technicals.rsi !== null && (
          <div className={`p-3 rounded-xl ${getRsiBgColor(technicals.rsi)}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wide">RSI (14)</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getRsiBgColor(technicals.rsi)} ${getRsiColor(technicals.rsi)}`}>
                {getRsiLabel(technicals.rsi)}
              </span>
            </div>
            <p className={`text-2xl font-bold tabular-nums ${getRsiColor(technicals.rsi)}`}>
              {technicals.rsi.toFixed(2)}
            </p>
            {/* RSI bar */}
            <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  technicals.rsi >= 70 ? 'bg-red-500' : technicals.rsi <= 30 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(technicals.rsi, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-slate-400">
              <span>0</span>
              <span>30</span>
              <span>70</span>
              <span>100</span>
            </div>
          </div>
        )}

        {/* MACD */}
        {technicals.macd && (
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wide mb-2">MACD (12, 26, 9)</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-300">MACD</p>
                <p className={`text-sm font-semibold tabular-nums ${technicals.macd.macdLine >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {technicals.macd.macdLine.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-300">Signal</p>
                <p className="text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                  {technicals.macd.signalLine.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-300">Histogram</p>
                <p className={`text-sm font-semibold tabular-nums ${technicals.macd.histogram >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {technicals.macd.histogram.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bollinger Bands */}
        {technicals.bollingerBands && (
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wide mb-2">Bollinger Bands (20, 2)</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-300">Upper</p>
                <p className="text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                  ${technicals.bollingerBands.upperBand.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-300">Middle</p>
                <p className="text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                  ${technicals.bollingerBands.middleBand.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-300">Lower</p>
                <p className="text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                  ${technicals.bollingerBands.lowerBand.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
