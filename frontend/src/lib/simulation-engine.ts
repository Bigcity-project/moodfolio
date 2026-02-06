import type { StrategyCard, SimulationResult } from './dashboard-types'

export function simulatePnL(
  strategy: StrategyCard,
  currentPrice: number,
  projectedPrice: number,
  investmentAmount: number,
): SimulationResult {
  if (currentPrice <= 0) {
    return { pnl: 0, returnPercent: 0, breakEven: strategy.breakEven, riskRewardRatio: strategy.riskReward }
  }

  const priceChangePercent = ((projectedPrice - currentPrice) / currentPrice) * 100

  switch (strategy.tier) {
    case 'conservative':
      return simulateSpot(priceChangePercent, investmentAmount, strategy)
    case 'aggressive':
      return simulateLeveraged(priceChangePercent, investmentAmount, strategy)
    case 'strategic':
      return simulateSpread(projectedPrice, investmentAmount, strategy)
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
  projectedPrice: number,
  investmentAmount: number,
  strategy: StrategyCard,
): SimulationResult {
  const isBull = strategy.id.startsWith('bull')
  const lower = strategy.lowerStrike ?? strategy.breakEven
  const upper = strategy.upperStrike ?? strategy.breakEven
  const strikeWidth = upper - lower

  let returnPercent: number

  if (strikeWidth <= 0) {
    // Degenerate spread (should not happen with real BB data)
    returnPercent = 0
  } else if (isBull) {
    // Bull call spread P&L profile:
    //   projected <= lower strike → max loss
    //   projected >= upper strike → max profit
    //   between strikes → linear interpolation
    if (projectedPrice <= lower) {
      returnPercent = -strategy.maxLoss
    } else if (projectedPrice >= upper) {
      returnPercent = strategy.expectedReturn
    } else {
      const fraction = (projectedPrice - lower) / strikeWidth
      returnPercent = -strategy.maxLoss + fraction * (strategy.expectedReturn + strategy.maxLoss)
    }
  } else {
    // Bear put spread P&L profile:
    //   projected >= upper strike → max loss
    //   projected <= lower strike → max profit
    //   between strikes → linear interpolation
    if (projectedPrice >= upper) {
      returnPercent = -strategy.maxLoss
    } else if (projectedPrice <= lower) {
      returnPercent = strategy.expectedReturn
    } else {
      const fraction = (upper - projectedPrice) / strikeWidth
      returnPercent = -strategy.maxLoss + fraction * (strategy.expectedReturn + strategy.maxLoss)
    }
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
