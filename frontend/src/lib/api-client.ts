// Use empty string to proxy through Next.js rewrites (avoids firewall issues)
const API_BASE_URL = ''

export interface MarketWeatherResponse {
  moodScore: number
  weatherType: 'SUNNY' | 'CLOUDY' | 'RAINY' | 'STORMY'
  trend: 'UP' | 'DOWN' | 'NEUTRAL'
  mainFactors: {
    name: string
    value: number
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  }[]
  timestamp: string
}

export interface StockIndicatorsDto {
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number | null
  trailingPE: number | null
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  dayHigh: number
  dayLow: number
}

export interface NewsArticleDto {
  title: string
  url: string
  publishedAt: string
  description: string | null
}

export interface StockAnalysisDto {
  summary: string
  recommendation: 'BUY' | 'HOLD' | 'SELL'
  reasoning: string
}

export interface MacdDto {
  macdLine: number
  signalLine: number
  histogram: number
}

export interface BollingerBandsDto {
  upperBand: number
  middleBand: number
  lowerBand: number
}

export interface TechnicalIndicatorsDto {
  rsi: number | null
  macd: MacdDto | null
  bollingerBands: BollingerBandsDto | null
}

export interface PeerStockDto {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

export interface IncomeStatementQuarterDto {
  endDate: string
  revenue: number | null
  grossProfit: number | null
  operatingIncome: number | null
  netIncome: number | null
  eps: number | null
}

export interface BalanceSheetQuarterDto {
  endDate: string
  totalAssets: number | null
  totalLiabilities: number | null
  totalEquity: number | null
  cash: number | null
  totalDebt: number | null
}

export interface CashFlowQuarterDto {
  endDate: string
  operatingCashFlow: number | null
  investingCashFlow: number | null
  financingCashFlow: number | null
  freeCashFlow: number | null
  capitalExpenditure: number | null
}

export interface FinancialStatementsDto {
  incomeStatements: IncomeStatementQuarterDto[]
  balanceSheets: BalanceSheetQuarterDto[]
  cashFlows: CashFlowQuarterDto[]
}

export interface StockAnalysisResponse {
  symbol: string
  name: string
  indicators: StockIndicatorsDto
  news: NewsArticleDto[]
  analysis: StockAnalysisDto
  timestamp: string
  technicalIndicators: TechnicalIndicatorsDto | null
  peerStocks: PeerStockDto[] | null
  financials: FinancialStatementsDto | null
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }))
    throw new Error(error.message || `HTTP error ${response.status}`)
  }
  return response.json()
}

export const api = {
  async getMarketWeather(): Promise<MarketWeatherResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/market/weather`)
    return handleResponse(response)
  },

  async getStockAnalysis(symbol: string): Promise<StockAnalysisResponse> {
    const encoded = encodeURIComponent(symbol.trim().toUpperCase())
    const response = await fetch(`${API_BASE_URL}/api/v1/stock/${encoded}`)
    return handleResponse(response)
  },
}
