const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface TransactionDto {
  date: string
  symbol: string
  action: 'BUY' | 'SELL'
  quantity: number
  price: number
}

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

export interface DoNothingSimulationResponse {
  actualReturnPct: number
  doNothingReturnPct: number
  performanceDrag: number
  verdict: string
  chartData: {
    date: string
    actualValue: number
    doNothingValue: number
  }[]
}

export interface PersonaAnalysisResponse {
  personaId: 'HODLER' | 'DAY_TRADER' | 'PANIC_SELLER' | 'SNIPER'
  displayName: string
  traits: string[]
  description: string
  advice: string
  stats: {
    avgHoldingDays: number
    turnoverRate: number
    panicSellRatio: number
    winRate: number
  }
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

  async runDoNothingSimulation(transactions: TransactionDto[]): Promise<DoNothingSimulationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/simulation/do_nothing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions }),
    })
    return handleResponse(response)
  },

  async analyzePersona(transactions: TransactionDto[]): Promise<PersonaAnalysisResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/analysis/persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions }),
    })
    return handleResponse(response)
  },
}
