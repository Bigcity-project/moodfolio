'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { computeStrategies } from '@/lib/strategy-engine'
import { StrategyCardComponent } from '../strategy/StrategyCard'
import { useTranslation } from '@/lib/i18n/context'
import type { StockAnalysisResponse } from '@/lib/api-client'
import type { Stance, StrategyCard } from '@/lib/dashboard-types'

interface PhaseStrategyProps {
  stockData: StockAnalysisResponse
  stance: Stance
  selectedStrategy: StrategyCard | null
  onStrategySelect: (strategy: StrategyCard) => void
}

export function PhaseStrategy({
  stockData,
  stance,
  selectedStrategy,
  onStrategySelect,
}: PhaseStrategyProps) {
  const strategies = useMemo(
    () => computeStrategies(stockData, stance),
    [stockData, stance]
  )
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center w-full px-6">
      <motion.h2
        className="text-white/60 text-lg mb-2 tracking-wide"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {t('strategy.title')}
      </motion.h2>

      <motion.p
        className="text-white/30 text-sm mb-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        {t(`strategy.subtitle.${stance}`, { symbol: stockData.symbol })}
      </motion.p>

      {/* Cards carousel */}
      <div className="flex gap-6 overflow-x-auto pb-4 max-w-full px-4"
        style={{ perspective: '1200px' }}
      >
        {strategies.map((strategy, index) => (
          <StrategyCardComponent
            key={strategy.id}
            strategy={strategy}
            index={index}
            isSelected={selectedStrategy?.id === strategy.id}
            onClick={() => onStrategySelect(strategy)}
            stance={stance}
          />
        ))}
      </div>

      {selectedStrategy && (
        <motion.p
          className="mt-8 text-white/30 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {t('strategy.scrollHint')}
        </motion.p>
      )}
    </div>
  )
}
