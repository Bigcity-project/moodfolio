'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/context'
import type { StockAnalysisResponse } from '@/lib/api-client'
import type { Stance } from '@/lib/dashboard-types'

interface PhaseVerdictProps {
  stockData: StockAnalysisResponse
  stance: Stance | null
  onStanceSelect: (stance: Stance) => void
}

function computeBullBearProbability(data: StockAnalysisResponse): { bull: number; bear: number } {
  let bull = 50

  if (data.analysis.recommendation === 'BUY') bull += 20
  else if (data.analysis.recommendation === 'SELL') bull -= 20

  const rsi = data.technicalIndicators?.rsi
  if (rsi !== null && rsi !== undefined) {
    if (rsi < 30) bull += 10
    else if (rsi > 70) bull -= 10
  }

  const histogram = data.technicalIndicators?.macd?.histogram
  if (histogram !== null && histogram !== undefined) {
    const macdSignal = Math.max(-10, Math.min(10, histogram * 2))
    bull += macdSignal
  }

  const range = data.indicators.fiftyTwoWeekHigh - data.indicators.fiftyTwoWeekLow
  if (range > 0) {
    const position = (data.indicators.price - data.indicators.fiftyTwoWeekLow) / range
    const rangeSignal = (0.5 - position) * 20
    bull += rangeSignal
  }

  bull = Math.max(10, Math.min(90, Math.round(bull)))
  return { bull, bear: 100 - bull }
}

export function PhaseVerdict({ stockData, stance, onStanceSelect }: PhaseVerdictProps) {
  const { bull, bear } = useMemo(() => computeBullBearProbability(stockData), [stockData])
  const { t } = useTranslation()

  const tiltDeg = ((bull - 50) / 50) * 30

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-6">
      <motion.h2
        className="text-white/60 text-lg mb-12 tracking-wide"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {t('verdict.title')}
      </motion.h2>

      {/* Balance beam SVG */}
      <motion.div
        className="relative mb-12"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <svg width="360" height="200" viewBox="0 0 360 200">
          <polygon points="180,200 160,160 200,160" fill="rgba(255,255,255,0.15)" />
          <motion.g
            initial={{ rotate: 0 }}
            animate={{ rotate: -tiltDeg }}
            transition={{ duration: 1.2, delay: 0.5, type: 'spring', stiffness: 60 }}
            style={{ transformOrigin: '180px 155px' }}
          >
            <rect x="30" y="150" width="300" height="6" rx="3" fill="rgba(255,255,255,0.2)" />
            <circle cx="60" cy="140" r="28" fill="rgba(45, 212, 191, 0.15)" stroke="rgba(45, 212, 191, 0.4)" strokeWidth="2" />
            <text x="60" y="137" textAnchor="middle" className="fill-teal-400 text-[11px] font-bold">
              {bull}%
            </text>
            <text x="60" y="150" textAnchor="middle" className="fill-teal-400/60 text-[7px]">
              {t('verdict.bull')}
            </text>
            <circle cx="300" cy="140" r="28" fill="rgba(251, 146, 60, 0.15)" stroke="rgba(251, 146, 60, 0.4)" strokeWidth="2" />
            <text x="300" y="137" textAnchor="middle" className="fill-orange-400 text-[11px] font-bold">
              {bear}%
            </text>
            <text x="300" y="150" textAnchor="middle" className="fill-orange-400/60 text-[7px]">
              {t('verdict.bear')}
            </text>
          </motion.g>
        </svg>
      </motion.div>

      {/* Probability bar */}
      <motion.div
        className="w-full max-w-sm mb-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex h-3 rounded-full overflow-hidden bg-white/5">
          <motion.div
            className="bg-gradient-to-r from-teal-500 to-teal-400"
            initial={{ width: '50%' }}
            animate={{ width: `${bull}%` }}
            transition={{ duration: 1, delay: 1, type: 'spring' }}
          />
          <motion.div
            className="bg-gradient-to-r from-orange-400 to-orange-500"
            initial={{ width: '50%' }}
            animate={{ width: `${bear}%` }}
            transition={{ duration: 1, delay: 1, type: 'spring' }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-teal-400">{t('verdict.bullishPercent', { percent: bull })}</span>
          <span className="text-orange-400">{t('verdict.bearishPercent', { percent: bear })}</span>
        </div>
      </motion.div>

      {/* Stance buttons */}
      <motion.div
        className="flex gap-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2 }}
      >
        <Button
          onClick={() => onStanceSelect('bullish')}
          className={`h-14 px-8 text-base rounded-2xl transition-all ${
            stance === 'bullish'
              ? 'bg-teal-500 text-white shadow-[0_0_30px_rgba(45,212,191,0.4)] scale-105'
              : 'bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/30'
          }`}
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          {t('verdict.seeUpside')}
        </Button>

        <Button
          onClick={() => onStanceSelect('bearish')}
          className={`h-14 px-8 text-base rounded-2xl transition-all ${
            stance === 'bearish'
              ? 'bg-orange-500 text-white shadow-[0_0_30px_rgba(251,146,60,0.4)] scale-105'
              : 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-500/30'
          }`}
        >
          <TrendingDown className="w-5 h-5 mr-2" />
          {t('verdict.seeDownside')}
        </Button>
      </motion.div>

      {stance && (
        <motion.p
          className="mt-8 text-white/30 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {t('verdict.scrollHint')}
        </motion.p>
      )}
    </div>
  )
}
