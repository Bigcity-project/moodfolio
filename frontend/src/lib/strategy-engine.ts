import type { StockAnalysisResponse } from './api-client'
import type { Stance, StrategyCard } from './dashboard-types'

export function computeStrategies(
  data: StockAnalysisResponse,
  stance: Stance
): StrategyCard[] {
  const price = data.indicators.price
  const high52 = data.indicators.fiftyTwoWeekHigh
  const low52 = data.indicators.fiftyTwoWeekLow
  const bb = data.technicalIndicators?.bollingerBands
  const rsi = data.technicalIndicators?.rsi

  if (stance === 'bullish') {
    return computeBullishStrategies(price, high52, low52, bb, rsi)
  }
  return computeBearishStrategies(price, high52, low52, bb, rsi)
}

function computeBullishStrategies(
  price: number,
  high52: number,
  low52: number,
  bb: { upperBand: number; middleBand: number; lowerBand: number } | null | undefined,
  rsi: number | null | undefined,
): StrategyCard[] {
  const upsidePercent = high52 > price ? ((high52 - price) / price) * 100 : 5
  const downsideToLow = price > low52 ? ((price - low52) / price) * 100 : 1

  const conservative: StrategyCard = {
    id: 'bull-conservative',
    tier: 'conservative',
    expectedReturn: round(upsidePercent),
    maxLoss: round(downsideToLow),
    leverage: 1,
    breakEven: price,
    riskReward: round(upsidePercent / (downsideToLow || 1)),
  }

  const leveragedReturn = upsidePercent * 2.5
  const leveragedLoss = Math.min(100, downsideToLow * 2.5)
  const aggressive: StrategyCard = {
    id: 'bull-aggressive',
    tier: 'aggressive',
    expectedReturn: round(leveragedReturn),
    maxLoss: round(leveragedLoss),
    leverage: 2.5,
    breakEven: round(price * 1.02),
    riskReward: round(leveragedReturn / (leveragedLoss || 1)),
  }

  const upper = bb?.upperBand ?? price * 1.1
  const middle = bb?.middleBand ?? price
  const lower = bb?.lowerBand ?? price * 0.9
  const maxProfit = ((upper - middle) / middle) * 100
  const maxLossSpread = ((middle - lower) / middle) * 100

  const strategic: StrategyCard = {
    id: 'bull-strategic',
    tier: 'strategic',
    expectedReturn: round(maxProfit),
    maxLoss: round(maxLossSpread),
    leverage: 1,
    breakEven: round(lower + (upper - lower) * 0.3),
    riskReward: round(maxProfit / (maxLossSpread || 1)),
    descriptionParams: {
      lowerStrike: `$${round(lower)}`,
      upperStrike: `$${round(upper)}`,
    },
  }

  return [conservative, aggressive, strategic]
}

function computeBearishStrategies(
  price: number,
  high52: number,
  low52: number,
  bb: { upperBand: number; middleBand: number; lowerBand: number } | null | undefined,
  rsi: number | null | undefined,
): StrategyCard[] {
  const downsidePercent = price > low52 ? ((price - low52) / price) * 100 : 5
  const upsideToHigh = high52 > price ? ((high52 - price) / price) * 100 : 1

  const hedging: StrategyCard = {
    id: 'bear-conservative',
    tier: 'conservative',
    expectedReturn: round(downsidePercent),
    maxLoss: round(upsideToHigh),
    leverage: 1,
    breakEven: price,
    riskReward: round(downsidePercent / (upsideToHigh || 1)),
  }

  const leveragedDown = downsidePercent * 2.5
  const leveragedLoss = Math.min(100, upsideToHigh * 2.5)
  const speculative: StrategyCard = {
    id: 'bear-aggressive',
    tier: 'aggressive',
    expectedReturn: round(leveragedDown),
    maxLoss: round(leveragedLoss),
    leverage: 2.5,
    breakEven: round(price * 0.98),
    riskReward: round(leveragedDown / (leveragedLoss || 1)),
  }

  const upper = bb?.upperBand ?? price * 1.1
  const middle = bb?.middleBand ?? price
  const lower = bb?.lowerBand ?? price * 0.9
  const premiumEstimate = rsi !== null && rsi !== undefined
    ? ((rsi / 100) * 3) + 1
    : 2
  const maxProfit = ((middle - lower) / middle) * 100
  const maxLossSpread = ((upper - middle) / middle) * 100

  const income: StrategyCard = {
    id: 'bear-strategic',
    tier: 'strategic',
    expectedReturn: round(maxProfit),
    maxLoss: round(maxLossSpread),
    leverage: 1,
    breakEven: round(upper - (upper - lower) * 0.3),
    riskReward: round(maxProfit / (maxLossSpread || 1)),
    descriptionParams: {
      upperStrike: `$${round(upper)}`,
      lowerStrike: `$${round(lower)}`,
      premium: premiumEstimate.toFixed(1),
    },
  }

  return [hedging, speculative, income]
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}
