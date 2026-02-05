'use client'

import { motion } from 'framer-motion'
import { MoodOrb } from './MoodOrb'
import { cn } from '@/lib/utils'
import type { MarketWeatherResponse } from '@/lib/api-client'
import { Cloud, CloudRain, CloudLightning, Sun, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MoodCardProps {
  data: MarketWeatherResponse
}

const weatherIcons = {
  SUNNY: Sun,
  CLOUDY: Cloud,
  RAINY: CloudRain,
  STORMY: CloudLightning,
}

const trendIcons = {
  UP: TrendingUp,
  DOWN: TrendingDown,
  NEUTRAL: Minus,
}

const impactColors = {
  POSITIVE: 'text-green-600',
  NEGATIVE: 'text-red-600',
  NEUTRAL: 'text-gray-600',
}

export function MoodCard({ data }: MoodCardProps) {
  const WeatherIcon = weatherIcons[data.weatherType]
  const TrendIcon = trendIcons[data.trend]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Market Weather</h2>
        <div className="flex items-center gap-2">
          <WeatherIcon className="w-8 h-8 text-gray-700" />
          <TrendIcon className={cn(
            'w-6 h-6',
            data.trend === 'UP' ? 'text-green-500' :
            data.trend === 'DOWN' ? 'text-red-500' : 'text-gray-400'
          )} />
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <MoodOrb moodScore={data.moodScore} weatherType={data.weatherType} size="lg" />
      </div>

      <div className="text-center mb-6">
        <span className="text-lg font-semibold text-gray-600 capitalize">
          {data.weatherType.toLowerCase()} Market
        </span>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Key Factors
        </h3>
        {data.mainFactors.map((factor) => (
          <div
            key={factor.name}
            className="flex items-center justify-between py-2 border-b border-gray-100"
          >
            <span className="text-gray-700 font-medium">{factor.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{factor.value.toFixed(2)}</span>
              <span className={cn('text-sm font-semibold', impactColors[factor.impact])}>
                {factor.impact}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center text-xs text-gray-400">
        Last updated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </motion.div>
  )
}
