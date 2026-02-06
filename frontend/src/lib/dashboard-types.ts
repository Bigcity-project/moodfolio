import type {
  StockAnalysisResponse,
  MarketWeatherResponse,
} from './api-client'

export type Stance = 'bullish' | 'bearish'

export type StrategyTier = 'conservative' | 'aggressive' | 'strategic'

export interface StrategyCard {
  id: string
  tier: StrategyTier
  expectedReturn: number
  maxLoss: number
  leverage: number
  breakEven: number
  riskReward: number
  descriptionParams?: Record<string, string | number>
}

export interface SimulationResult {
  pnl: number
  returnPercent: number
  breakEven: number
  riskRewardRatio: number
}

export interface DashboardState {
  weatherData: MarketWeatherResponse | null
  weatherLoading: boolean
  weatherError: string | null
  stockData: StockAnalysisResponse | null
  stockLoading: boolean
  stockError: string | null
  stance: Stance | null
  selectedStrategy: StrategyCard | null
  activePhase: number
}

export type DashboardAction =
  | { type: 'SET_WEATHER_LOADING' }
  | { type: 'SET_WEATHER_DATA'; payload: MarketWeatherResponse }
  | { type: 'SET_WEATHER_ERROR'; payload: string }
  | { type: 'SET_STOCK_LOADING' }
  | { type: 'SET_STOCK_DATA'; payload: StockAnalysisResponse }
  | { type: 'SET_STOCK_ERROR'; payload: string }
  | { type: 'SET_STANCE'; payload: Stance }
  | { type: 'SET_SELECTED_STRATEGY'; payload: StrategyCard }
  | { type: 'SET_ACTIVE_PHASE'; payload: number }
  | { type: 'RESET_STOCK' }
