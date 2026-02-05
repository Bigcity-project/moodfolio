'use client'

import { motion } from 'framer-motion'
import type { PersonaAnalysisResponse } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { User, Timer, RefreshCcw, AlertTriangle, Target } from 'lucide-react'

interface PersonaCardProps {
  data: PersonaAnalysisResponse
}

const personaIcons = {
  HODLER: Timer,
  DAY_TRADER: RefreshCcw,
  PANIC_SELLER: AlertTriangle,
  SNIPER: Target,
}

const personaColors = {
  HODLER: 'from-emerald-400 to-teal-500',
  DAY_TRADER: 'from-blue-400 to-indigo-500',
  PANIC_SELLER: 'from-red-400 to-rose-500',
  SNIPER: 'from-purple-400 to-violet-500',
}

export function PersonaCard({ data }: PersonaCardProps) {
  const Icon = personaIcons[data.personaId] || User
  const gradientColors = personaColors[data.personaId] || 'from-gray-400 to-gray-500'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden"
    >
      <div className={cn('bg-gradient-to-r p-6', gradientColors)}>
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-full p-3">
            <Icon className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{data.displayName}</h2>
            <div className="flex gap-2 mt-2">
              {data.traits.map((trait) => (
                <span
                  key={trait}
                  className="px-2 py-1 bg-white/20 rounded-full text-xs text-white font-medium"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <p className="text-gray-600 mb-6">{data.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatCard
            label="Avg Holding"
            value={`${data.stats.avgHoldingDays.toFixed(1)} days`}
          />
          <StatCard
            label="Turnover Rate"
            value={`${data.stats.turnoverRate.toFixed(1)}%`}
          />
          <StatCard
            label="Panic Sell Ratio"
            value={`${data.stats.panicSellRatio.toFixed(1)}%`}
            isNegative={data.stats.panicSellRatio > 30}
          />
          <StatCard
            label="Win Rate"
            value={`${data.stats.winRate.toFixed(1)}%`}
            isPositive={data.stats.winRate > 50}
          />
        </div>

        <div className="bg-blue-50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Advice</h3>
          <p className="text-blue-700 text-sm">{data.advice}</p>
        </div>
      </div>
    </motion.div>
  )
}

function StatCard({
  label,
  value,
  isPositive,
  isNegative,
}: {
  label: string
  value: string
  isPositive?: boolean
  isNegative?: boolean
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={cn(
        'text-lg font-bold',
        isPositive && 'text-green-600',
        isNegative && 'text-red-600',
        !isPositive && !isNegative && 'text-gray-800'
      )}>
        {value}
      </div>
    </div>
  )
}
