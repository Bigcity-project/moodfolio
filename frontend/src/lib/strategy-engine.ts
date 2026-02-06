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

function safeRatio(numerator: number, denominator: number): number {
  if (denominator === 0) return 0
  return round(numerator / denominator)
}

function computeBullishStrategies(
  price: number,
  high52: number,
  low52: number,
  bb: { upperBand: number; middleBand: number; lowerBand: number } | null | undefined,
  rsi: number | null | undefined,
): StrategyCard[] {
  // Real data only — clamp to 0 when price is at/beyond 52w boundary
  const upsidePercent = Math.max(0, ((high52 - price) / price) * 100)
  const downsideToLow = Math.max(0, ((price - low52) / price) * 100)

  const conservative: StrategyCard = {
    id: 'bull-conservative',
    tier: 'conservative',
    expectedReturn: round(upsidePercent),
    maxLoss: round(downsideToLow),
    leverage: 1,
    breakEven: price,
    riskReward: safeRatio(upsidePercent, downsideToLow),
  }

  const leveragedReturn = upsidePercent * 2.5
  const leveragedLoss = Math.min(100, downsideToLow * 2.5)
  const aggressive: StrategyCard = {
    id: 'bull-aggressive',
    tier: 'aggressive',
    expectedReturn: round(leveragedReturn),
    maxLoss: round(leveragedLoss),
    leverage: 2.5,
    breakEven: price,
    riskReward: safeRatio(leveragedReturn, leveragedLoss),
  }

  const strategies: StrategyCard[] = [conservative, aggressive]

  // Only show strategic (spread) when real Bollinger Bands data exists
  if (bb) {
    const maxProfit = ((bb.upperBand - bb.middleBand) / bb.middleBand) * 100
    const maxLossSpread = ((bb.middleBand - bb.lowerBand) / bb.middleBand) * 100

    const strategic: StrategyCard = {
      id: 'bull-strategic',
      tier: 'strategic',
      expectedReturn: round(maxProfit),
      maxLoss: round(maxLossSpread),
      leverage: 1,
      breakEven: round(bb.lowerBand + (maxLossSpread / (maxLossSpread + maxProfit)) * (bb.upperBand - bb.lowerBand)),
      riskReward: safeRatio(maxProfit, maxLossSpread),
      lowerStrike: round(bb.lowerBand),
      upperStrike: round(bb.upperBand),
      descriptionParams: {
        lowerStrike: `$${round(bb.lowerBand)}`,
        upperStrike: `$${round(bb.upperBand)}`,
      },
    }
    strategies.push(strategic)
  }

  return strategies
}

function computeBearishStrategies(
  price: number,
  high52: number,
  low52: number,
  bb: { upperBand: number; middleBand: number; lowerBand: number } | null | undefined,
  rsi: number | null | undefined,
): StrategyCard[] {
  // Real data only — clamp to 0 when price is at/beyond 52w boundary
  const downsidePercent = Math.max(0, ((price - low52) / price) * 100)
  const upsideToHigh = Math.max(0, ((high52 - price) / price) * 100)

  const hedging: StrategyCard = {
    id: 'bear-conservative',
    tier: 'conservative',
    expectedReturn: round(downsidePercent),
    maxLoss: round(upsideToHigh),
    leverage: 1,
    breakEven: price,
    riskReward: safeRatio(downsidePercent, upsideToHigh),
  }

  const leveragedDown = downsidePercent * 2.5
  const leveragedLoss = Math.min(100, upsideToHigh * 2.5)
  const speculative: StrategyCard = {
    id: 'bear-aggressive',
    tier: 'aggressive',
    expectedReturn: round(leveragedDown),
    maxLoss: round(leveragedLoss),
    leverage: 2.5,
    breakEven: price,
    riskReward: safeRatio(leveragedDown, leveragedLoss),
  }

  const strategies: StrategyCard[] = [hedging, speculative]

  // Only show strategic (spread) when real Bollinger Bands data exists
  if (bb) {
    const maxProfit = ((bb.middleBand - bb.lowerBand) / bb.middleBand) * 100
    const maxLossSpread = ((bb.upperBand - bb.middleBand) / bb.middleBand) * 100

    const descriptionParams: Record<string, string | number> = {
      upperStrike: `$${round(bb.upperBand)}`,
      lowerStrike: `$${round(bb.lowerBand)}`,
    }
    // Only include premium estimate when real RSI data exists
    if (rsi !== null && rsi !== undefined) {
      descriptionParams.premium = (((rsi / 100) * 3) + 1).toFixed(1)
    }

    const income: StrategyCard = {
      id: 'bear-strategic',
      tier: 'strategic',
      expectedReturn: round(maxProfit),
      maxLoss: round(maxLossSpread),
      leverage: 1,
      breakEven: round(bb.upperBand - (maxLossSpread / (maxLossSpread + maxProfit)) * (bb.upperBand - bb.lowerBand)),
      riskReward: safeRatio(maxProfit, maxLossSpread),
      lowerStrike: round(bb.lowerBand),
      upperStrike: round(bb.upperBand),
      descriptionParams,
    }
    strategies.push(income)
  }

  return strategies
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}
