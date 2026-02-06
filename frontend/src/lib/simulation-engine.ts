import type { StrategyCard, SimulationResult } from './dashboard-types'

export function simulatePnL(
  strategy: StrategyCard,
  currentPrice: number,
  projectedPrice: number,
  investmentAmount: number,
): SimulationResult {
  const priceChange = projectedPrice - currentPrice
  const priceChangePercent = (priceChange / currentPrice) * 100

  switch (strategy.tier) {
    case 'conservative':
      return simulateSpot(priceChangePercent, investmentAmount, strategy)
    case 'aggressive':
      return simulateLeveraged(priceChangePercent, investmentAmount, strategy)
    case 'strategic':
      return simulateSpread(currentPrice, projectedPrice, investmentAmount, strategy)
    default:
      return simulateSpot(priceChangePercent, investmentAmount, strategy)
  }
}

function simulateSpot(
  priceChangePercent: number,
  investmentAmount: number,
  strategy: StrategyCard,
): SimulationResult {
  // For bearish spot (inverse), the return is inverted
  const isInverse = strategy.id.startsWith('bear')
  const effectiveChange = isInverse ? -priceChangePercent : priceChangePercent
  const returnPercent = effectiveChange * strategy.leverage
  const pnl = (returnPercent / 100) * investmentAmount

  return {
    pnl: round(pnl),
    returnPercent: round(returnPercent),
    breakEven: strategy.breakEven,
    riskRewardRatio: strategy.riskReward,
  }
}

function simulateLeveraged(
  priceChangePercent: number,
  investmentAmount: number,
  strategy: StrategyCard,
): SimulationResult {
  const isInverse = strategy.id.startsWith('bear')
  const effectiveChange = isInverse ? -priceChangePercent : priceChangePercent
  const returnPercent = effectiveChange * strategy.leverage

  // Cap loss at -100% (can't lose more than invested, assuming no margin call scenario)
  const cappedReturn = Math.max(-100, returnPercent)
  const pnl = (cappedReturn / 100) * investmentAmount

  return {
    pnl: round(pnl),
    returnPercent: round(cappedReturn),
    breakEven: strategy.breakEven,
    riskRewardRatio: strategy.riskReward,
  }
}

function simulateSpread(
  currentPrice: number,
  projectedPrice: number,
  investmentAmount: number,
  strategy: StrategyCard,
): SimulationResult {
  // Linear interpolation between max loss and max profit
  const isBull = strategy.id.startsWith('bull')
  const direction = isBull
    ? (projectedPrice - currentPrice) / currentPrice
    : (currentPrice - projectedPrice) / currentPrice

  // Normalize to [-1, 1] range based on expected return and max loss
  const maxReturnRange = strategy.expectedReturn + strategy.maxLoss
  const normalizedDirection = (direction * 100) / (maxReturnRange || 1)

  let returnPercent: number
  if (normalizedDirection >= 0) {
    returnPercent = Math.min(strategy.expectedReturn, normalizedDirection * strategy.expectedReturn)
  } else {
    returnPercent = Math.max(-strategy.maxLoss, normalizedDirection * strategy.maxLoss)
  }

  const pnl = (returnPercent / 100) * investmentAmount

  return {
    pnl: round(pnl),
    returnPercent: round(returnPercent),
    breakEven: strategy.breakEven,
    riskRewardRatio: strategy.riskReward,
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}
