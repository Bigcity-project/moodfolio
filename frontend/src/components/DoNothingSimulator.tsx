'use client'

import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { DoNothingSimulationResponse } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface DoNothingSimulatorProps {
  data: DoNothingSimulationResponse
}

export function DoNothingSimulator({ data }: DoNothingSimulatorProps) {
  const isPositive = data.performanceDrag >= 0
  const isNeutral = Math.abs(data.performanceDrag) < 5

  const chartData = data.chartData.map((point) => ({
    date: point.date,
    'Your Portfolio': point.actualValue,
    'Do Nothing (SPY)': point.doNothingValue,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-8"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Do-Nothing Simulator</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">Your Returns</div>
          <div className={cn(
            'text-2xl font-bold',
            data.actualReturnPct >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {data.actualReturnPct >= 0 ? '+' : ''}{data.actualReturnPct.toFixed(2)}%
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">SPY Returns</div>
          <div className={cn(
            'text-2xl font-bold',
            data.doNothingReturnPct >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {data.doNothingReturnPct >= 0 ? '+' : ''}{data.doNothingReturnPct.toFixed(2)}%
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">Performance Drag</div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-2xl font-bold',
              isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {data.performanceDrag >= 0 ? '+' : ''}{data.performanceDrag.toFixed(2)}%
            </span>
            {isPositive ? (
              <TrendingUp className="w-6 h-6 text-green-500" />
            ) : isNeutral ? (
              <Minus className="w-6 h-6 text-gray-400" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-500" />
            )}
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.slice(5)}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [`$${Number(value).toFixed(2)}`, '']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Your Portfolio"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Do Nothing (SPY)"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className={cn(
        'rounded-xl p-4 text-center',
        isPositive ? 'bg-green-50 text-green-800' :
        isNeutral ? 'bg-gray-50 text-gray-800' :
        'bg-red-50 text-red-800'
      )}>
        <p className="text-lg font-medium">{data.verdict}</p>
      </div>
    </motion.div>
  )
}
