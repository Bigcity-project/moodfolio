'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, Clock, Sparkles, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PriceProjectionChart } from '../strategy/PriceProjectionChart'
import { simulatePnL } from '@/lib/simulation-engine'
import { useTranslation } from '@/lib/i18n/context'
import type { StockAnalysisResponse } from '@/lib/api-client'
import type { StrategyCard, Stance } from '@/lib/dashboard-types'

interface PhaseSimulationProps {
  stockData: StockAnalysisResponse
  strategy: StrategyCard
  stance: Stance
}

const INVESTMENT_PRESETS = [1_000, 5_000, 10_000, 25_000, 50_000]
const TIME_PRESETS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '180d', days: 180 },
]

export function PhaseSimulation({ stockData, strategy, stance }: PhaseSimulationProps) {
  const { t } = useTranslation()
  const currentPrice = stockData.indicators.price
  const [projectedPrice, setProjectedPrice] = useState(() => {
    const direction = stance === 'bullish' ? 1 : -1
    return currentPrice * (1 + direction * (strategy.expectedReturn / 100) * 0.5)
  })
  const [investment, setInvestment] = useState(10_000)
  const [timeHorizon, setTimeHorizon] = useState(30)
  const [executed, setExecuted] = useState(false)
  const [burstParticles, setBurstParticles] = useState<Array<{ id: number; x: number; y: number; angle: number }>>([])

  const handleProjectedPriceChange = useCallback((price: number) => {
    setProjectedPrice(price)
  }, [])

  const simulation = useMemo(
    () => simulatePnL(strategy, currentPrice, projectedPrice, investment),
    [strategy, currentPrice, projectedPrice, investment]
  )

  function handleExecute() {
    // Particle burst
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      angle: (i / 50) * 360,
    }))
    setBurstParticles(particles)
    setExecuted(true)
    setTimeout(() => setBurstParticles([]), 2000)
  }

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-6 py-12">
      <motion.h2
        className="text-white/60 text-lg mb-2 tracking-wide"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {t('simulation.title')}
      </motion.h2>

      <motion.p
        className="text-white/30 text-sm mb-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        {t('simulation.subtitle', { strategy: t(`strategy.${strategy.id}.name`), symbol: stockData.symbol })}
      </motion.p>

      <div className="flex flex-col lg:flex-row gap-8 w-full items-start">
        {/* Chart */}
        <motion.div
          className="flex-1 min-w-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <PriceProjectionChart
            currentPrice={currentPrice}
            projectedPrice={projectedPrice}
            breakEven={strategy.breakEven}
            low52={stockData.indicators.fiftyTwoWeekLow}
            high52={stockData.indicators.fiftyTwoWeekHigh}
            onProjectedPriceChange={handleProjectedPriceChange}
            stance={stance}
          />
        </motion.div>

        {/* Sidebar */}
        <motion.div
          className="w-full lg:w-72 shrink-0 space-y-6"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          {/* P&L Display */}
          <div className="p-5 rounded-2xl border border-white/10"
            style={{ background: 'rgba(15, 23, 42, 0.8)' }}
          >
            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{t('simulation.projectedPnl')}</p>
            <p className={`text-3xl font-bold tabular-nums ${
              simulation.pnl >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {simulation.pnl >= 0 ? '+' : ''}{formatCurrency(simulation.pnl)}
            </p>
            <p className={`text-sm tabular-nums mt-1 ${
              simulation.returnPercent >= 0 ? 'text-green-400/70' : 'text-red-400/70'
            }`}>
              {simulation.returnPercent >= 0 ? '+' : ''}{simulation.returnPercent.toFixed(2)}%
            </p>
          </div>

          {/* Investment presets */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-3.5 h-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">{t('simulation.investment')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {INVESTMENT_PRESETS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setInvestment(amount)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    investment === amount
                      ? 'bg-white/15 text-white border border-white/20'
                      : 'bg-white/5 text-white/40 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {formatCurrencyShort(amount)}
                </button>
              ))}
            </div>
          </div>

          {/* Time horizon */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">{t('simulation.timeHorizon')}</span>
            </div>
            <div className="flex gap-2">
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset.days}
                  onClick={() => setTimeHorizon(preset.days)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    timeHorizon === preset.days
                      ? 'bg-white/15 text-white border border-white/20'
                      : 'bg-white/5 text-white/40 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Strategy stats summary */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-white/40">
              <span>{t('simulation.breakEven')}</span>
              <span className="text-white/60 tabular-nums">${simulation.breakEven.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/40">
              <span>{t('simulation.riskReward')}</span>
              <span className="text-white/60 tabular-nums">{simulation.riskRewardRatio.toFixed(1)}x</span>
            </div>
            <div className="flex justify-between text-white/40">
              <span>{t('simulation.maxLoss')}</span>
              <span className="text-red-400/70 tabular-nums">-{formatCurrency(investment * strategy.maxLoss / 100)}</span>
            </div>
            <div className="flex justify-between text-white/40">
              <span>{t('simulation.maxGain')}</span>
              <span className="text-green-400/70 tabular-nums">+{formatCurrency(investment * strategy.expectedReturn / 100)}</span>
            </div>
          </div>

          {/* Execute CTA */}
          {!executed ? (
            <div className="relative">
              <Button
                onClick={handleExecute}
                className={`w-full h-12 text-base rounded-2xl font-semibold ${
                  stance === 'bullish'
                    ? 'bg-teal-500 hover:bg-teal-600 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t('simulation.execute')}
              </Button>

              {/* Burst particles */}
              <AnimatePresence>
                {burstParticles.map((p) => {
                  const rad = (p.angle * Math.PI) / 180
                  return (
                    <motion.div
                      key={p.id}
                      className={`absolute w-2 h-2 rounded-full ${
                        stance === 'bullish' ? 'bg-teal-400' : 'bg-orange-400'
                      }`}
                      style={{ left: '50%', top: '50%' }}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{
                        x: Math.cos(rad) * 120,
                        y: Math.sin(rad) * 120,
                        opacity: 0,
                        scale: 0,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  )
                })}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              className="p-5 rounded-2xl border border-white/10 space-y-3"
              style={{ background: 'rgba(15, 23, 42, 0.8)' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className={`w-5 h-5 ${stance === 'bullish' ? 'text-teal-400' : 'text-orange-400'}`} />
                <span className="text-white font-semibold">{t('simulation.summary')}</span>
              </div>
              <div className="space-y-1 text-xs text-white/50">
                <p>{t('simulation.label.strategy', { name: t(`strategy.${strategy.id}.name`) })}</p>
                <p>{t('simulation.label.investment', { amount: formatCurrency(investment) })}</p>
                <p>{t('simulation.label.targetPrice', { price: `$${projectedPrice.toFixed(2)}` })}</p>
                <p>{t('simulation.label.horizon', { days: timeHorizon })}</p>
                <p className={simulation.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {t('simulation.label.pnl', {
                    pnl: `${simulation.pnl >= 0 ? '+' : ''}${formatCurrency(simulation.pnl)}`,
                    percent: `${simulation.returnPercent >= 0 ? '+' : ''}${simulation.returnPercent.toFixed(2)}`,
                  })}
                </p>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-400/80 leading-relaxed">
                  {t('simulation.disclaimer')}
                </p>
              </div>

              <Button
                variant="ghost"
                className="w-full text-white/40 hover:text-white/60 text-xs"
                onClick={() => setExecuted(false)}
              >
                {t('simulation.reset')}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function formatCurrency(amount: number): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(2)}K`
  return `${sign}$${abs.toFixed(2)}`
}

function formatCurrencyShort(amount: number): string {
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}
