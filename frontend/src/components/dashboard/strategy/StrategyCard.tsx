'use client'

import { motion } from 'framer-motion'
import { Shield, Zap, Target, ArrowRight } from 'lucide-react'
import type { StrategyCard as StrategyCardType } from '@/lib/dashboard-types'

interface StrategyCardProps {
  strategy: StrategyCardType
  index: number
  isSelected: boolean
  onClick: () => void
  stance: 'bullish' | 'bearish'
}

const tierConfig = {
  conservative: { icon: Shield, label: 'Conservative', accent: 'from-blue-500/20 to-blue-600/10' },
  aggressive: { icon: Zap, label: 'Aggressive', accent: 'from-purple-500/20 to-purple-600/10' },
  strategic: { icon: Target, label: 'Strategic', accent: 'from-emerald-500/20 to-emerald-600/10' },
}

export function StrategyCardComponent({ strategy, index, isSelected, onClick, stance }: StrategyCardProps) {
  const config = tierConfig[strategy.tier]
  const Icon = config.icon
  const stanceColor = stance === 'bullish' ? 'teal' : 'orange'

  return (
    <motion.button
      onClick={onClick}
      className={`relative w-[280px] shrink-0 text-left rounded-2xl border overflow-hidden transition-all ${
        isSelected
          ? `border-${stanceColor}-400/50 shadow-[0_0_30px_rgba(${stance === 'bullish' ? '45,212,191' : '251,146,60'},0.2)]`
          : 'border-white/10 hover:border-white/20'
      }`}
      style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)' }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -20 }}
    >
      {/* Top gradient accent */}
      <div className={`h-1 bg-gradient-to-r ${config.accent}`} />

      <div className="p-5">
        {/* Tier badge */}
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-4 h-4 text-white/60" />
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">
            {config.label}
          </span>
        </div>

        {/* Strategy name */}
        <h3 className="text-lg font-semibold text-white mb-2">{strategy.name}</h3>
        <p className="text-xs text-white/40 mb-4 leading-relaxed line-clamp-2">{strategy.description}</p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCell
            label="Expected Return"
            value={`${strategy.expectedReturn > 0 ? '+' : ''}${strategy.expectedReturn.toFixed(1)}%`}
            positive={strategy.expectedReturn > 0}
          />
          <StatCell
            label="Max Loss"
            value={`-${strategy.maxLoss.toFixed(1)}%`}
            positive={false}
          />
          <StatCell
            label="Break Even"
            value={`$${strategy.breakEven.toFixed(2)}`}
          />
          <StatCell
            label="Risk/Reward"
            value={`${strategy.riskReward.toFixed(1)}x`}
            positive={strategy.riskReward >= 1}
          />
        </div>

        {/* CTA */}
        <div className={`flex items-center justify-between text-xs ${
          isSelected ? 'text-white' : 'text-white/30'
        }`}>
          <span className="font-medium">{strategy.instrument}</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </motion.button>
  )
}

function StatCell({
  label,
  value,
  positive,
}: {
  label: string
  value: string
  positive?: boolean
}) {
  return (
    <div className="p-2 rounded-lg bg-white/5">
      <p className="text-[10px] text-white/30 mb-0.5">{label}</p>
      <p className={`text-sm font-semibold tabular-nums ${
        positive === true
          ? 'text-green-400'
          : positive === false
            ? 'text-red-400'
            : 'text-white/70'
      }`}>
        {value}
      </p>
    </div>
  )
}
