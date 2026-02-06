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

  // Conservative: Spot / ETF
  const conservative: StrategyCard = {
    id: 'bull-conservative',
    tier: 'conservative',
    name: 'Spot / ETF Buy',
    description: 'Buy and hold the stock or equivalent ETF. Low risk, direct market exposure.',
    instrument: 'Equity / ETF',
    expectedReturn: round(upsidePercent),
    maxLoss: round(((price - low52) / price) * 100),
    leverage: 1,
    breakEven: price,
    riskReward: upsidePercent > 0
      ? round(upsidePercent / (((price - low52) / price) * 100 || 1))
      : 1,
  }

  // Aggressive: Margin 2x / Call Option
  const leveragedReturn = upsidePercent * 2.5
  const aggressive: StrategyCard = {
    id: 'bull-aggressive',
    tier: 'aggressive',
    name: 'Leveraged / Call Option',
    description: 'Margin buy at 2-3x leverage or long call option. Higher reward, higher risk.',
    instrument: 'Margin / Call Option',
    expectedReturn: round(leveragedReturn),
    maxLoss: round(Math.min(100, ((price - low52) / price) * 100 * 2.5)),
    leverage: 2.5,
    breakEven: round(price * 1.02),
    riskReward: round(leveragedReturn / (Math.min(100, ((price - low52) / price) * 100 * 2.5) || 1)),
  }

  // Strategic: Bull Call Spread
  const upper = bb?.upperBand ?? price * 1.1
  const middle = bb?.middleBand ?? price
  const lower = bb?.lowerBand ?? price * 0.9
  const maxProfit = ((upper - middle) / middle) * 100
  const maxLossSpread = ((middle - lower) / middle) * 100

  const strategic: StrategyCard = {
    id: 'bull-strategic',
    tier: 'strategic',
    name: 'Bull Call Spread',
    description: `Buy call at $${round(lower)} strike, sell call at $${round(upper)} strike. Defined risk.`,
    instrument: 'Options Spread',
    expectedReturn: round(maxProfit),
    maxLoss: round(maxLossSpread),
    leverage: 1,
    breakEven: round(lower + (upper - lower) * 0.3),
    riskReward: round(maxProfit / (maxLossSpread || 1)),
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

  // Hedging: Inverse ETF
  const hedging: StrategyCard = {
    id: 'bear-conservative',
    tier: 'conservative',
    name: 'Inverse ETF / Hedge',
    description: 'Buy inverse ETF to profit from decline. Simple hedge with limited complexity.',
    instrument: 'Inverse ETF',
    expectedReturn: round(downsidePercent),
    maxLoss: round(((high52 - price) / price) * 100),
    leverage: 1,
    breakEven: price,
    riskReward: round(downsidePercent / (((high52 - price) / price) * 100 || 1)),
  }

  // Speculative: Long Put / Short
  const leveragedDown = downsidePercent * 2.5
  const speculative: StrategyCard = {
    id: 'bear-aggressive',
    tier: 'aggressive',
    name: 'Long Put / Short Sale',
    description: 'Buy put options or short the stock. High reward potential with significant risk.',
    instrument: 'Put Option / Short',
    expectedReturn: round(leveragedDown),
    maxLoss: round(Math.min(100, ((high52 - price) / price) * 100 * 2.5)),
    leverage: 2.5,
    breakEven: round(price * 0.98),
    riskReward: round(leveragedDown / (Math.min(100, ((high52 - price) / price) * 100 * 2.5) || 1)),
  }

  // Income: Covered Call / Bear Put Spread
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
    name: 'Bear Put Spread',
    description: `Buy put at $${round(upper)} strike, sell put at $${round(lower)} strike. Est. premium: ${premiumEstimate.toFixed(1)}%.`,
    instrument: 'Options Spread',
    expectedReturn: round(maxProfit),
    maxLoss: round(maxLossSpread),
    leverage: 1,
    breakEven: round(upper - (upper - lower) * 0.3),
    riskReward: round(maxProfit / (maxLossSpread || 1)),
  }

  return [hedging, speculative, income]
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}
