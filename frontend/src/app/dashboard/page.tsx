'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MoodOrb, getMoodInterpretation, type WeatherType } from '@/components/MoodOrb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  api,
  type MarketWeatherResponse,
  type DoNothingSimulationResponse,
  type PersonaAnalysisResponse,
  type TransactionDto,
} from '@/lib/api-client'
import {
  Loader2,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  BarChart3,
  User,
  Cloud,
  RefreshCw,
} from 'lucide-react'

const SAMPLE_TRANSACTIONS: TransactionDto[] = [
  { date: '2024-01-15', symbol: 'AAPL', action: 'BUY', quantity: 10, price: 185.5 },
  { date: '2024-02-20', symbol: 'AAPL', action: 'SELL', quantity: 5, price: 175.0 },
  { date: '2024-03-10', symbol: 'MSFT', action: 'BUY', quantity: 8, price: 410.25 },
  { date: '2024-04-05', symbol: 'GOOGL', action: 'BUY', quantity: 15, price: 155.75 },
  { date: '2024-05-15', symbol: 'MSFT', action: 'SELL', quantity: 4, price: 395.0 },
  { date: '2024-06-01', symbol: 'NVDA', action: 'BUY', quantity: 5, price: 1100.0 },
]

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weatherData, setWeatherData] = useState<MarketWeatherResponse | null>(null)
  const [simulationData, setSimulationData] = useState<DoNothingSimulationResponse | null>(null)
  const [personaData, setPersonaData] = useState<PersonaAnalysisResponse | null>(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  async function fetchAllData() {
    setLoading(true)
    setError(null)
    try {
      const [weather, simulation, persona] = await Promise.all([
        api.getMarketWeather(),
        api.runDoNothingSimulation(SAMPLE_TRANSACTIONS),
        api.analyzePersona(SAMPLE_TRANSACTIONS),
      ])
      setWeatherData(weather)
      setSimulationData(simulation)
      setPersonaData(persona)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data. Make sure the backend is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }

  const TrendIcon = weatherData?.trend === 'UP' ? TrendingUp : weatherData?.trend === 'DOWN' ? TrendingDown : Minus

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Moodfolio</h1>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={fetchAllData} disabled={loading}>
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh data</TooltipContent>
            </Tooltip>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-2xl mb-8 max-w-md mx-auto text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="text-slate-600 dark:text-slate-300">Loading market data...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Hero Section - Mood Orb */}
            {weatherData && (
              <section className="text-center py-8">
                <div className="flex justify-center mb-8">
                  <MoodOrb
                    moodScore={weatherData.moodScore}
                    weatherType={weatherData.weatherType as WeatherType}
                    size="xl"
                  />
                </div>

                <p className="text-xl text-slate-700 dark:text-slate-200 max-w-xl mx-auto mb-4">
                  {getMoodInterpretation(weatherData.moodScore, weatherData.weatherType as WeatherType)}
                </p>

                <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                  <TrendIcon className={`w-5 h-5 ${
                    weatherData.trend === 'UP' ? 'text-green-500' :
                    weatherData.trend === 'DOWN' ? 'text-red-500' : 'text-slate-400'
                  }`} />
                  <span className="text-sm">
                    Trend: {weatherData.trend.charAt(0) + weatherData.trend.slice(1).toLowerCase()}
                  </span>
                </div>
              </section>
            )}

            <Separator className="max-w-2xl mx-auto bg-slate-200 dark:bg-slate-700" />

            {/* Info Cards Grid */}
            <section>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Market Factors Card */}
                {weatherData && (
                  <Card glass className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-lg text-slate-900 dark:text-white">Market Factors</CardTitle>
                      </div>
                      <CardDescription>Key indicators affecting sentiment</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {weatherData.mainFactors.map((factor) => (
                        <div key={factor.name} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{factor.name}</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-3.5 h-3.5 text-slate-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  {factor.name === 'VIX' ? 'Volatility Index - measures market fear' :
                                   factor.name === 'RSI' ? 'Relative Strength Index - momentum indicator' :
                                   'Market indicator'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm tabular-nums text-slate-600 dark:text-slate-300">{factor.value.toFixed(2)}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              factor.impact === 'POSITIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              factor.impact === 'NEGATIVE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {factor.impact}
                            </span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Simulation Card */}
                {simulationData && (
                  <Card glass className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-lg text-slate-900 dark:text-white">Do-Nothing Test</CardTitle>
                      </div>
                      <CardDescription>Your trades vs. passive SPY</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Your Return</p>
                          <p className={`text-2xl font-bold ${simulationData.actualReturnPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {simulationData.actualReturnPct >= 0 ? '+' : ''}{simulationData.actualReturnPct.toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-center p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">SPY Return</p>
                          <p className={`text-2xl font-bold ${simulationData.doNothingReturnPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {simulationData.doNothingReturnPct >= 0 ? '+' : ''}{simulationData.doNothingReturnPct.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                        <p className="text-sm font-medium text-center text-slate-700 dark:text-slate-200">
                          {simulationData.verdict}
                        </p>
                      </div>

                      <div className="text-center">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          simulationData.actualReturnPct > simulationData.doNothingReturnPct
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {simulationData.actualReturnPct > simulationData.doNothingReturnPct
                            ? 'Outperformed Market'
                            : 'Consider Passive Strategy'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Persona Card */}
                {personaData && (
                  <Card glass className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-lg text-slate-900 dark:text-white">Your Persona</CardTitle>
                      </div>
                      <CardDescription>Trading style analysis</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <span className="text-4xl mb-2 block">
                          {personaData.personaId === 'HODLER' ? '💎' :
                           personaData.personaId === 'SNIPER' ? '🎯' :
                           personaData.personaId === 'DAY_TRADER' ? '⚡' : '🎲'}
                        </span>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {personaData.displayName}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <Tooltip>
                          <TooltipTrigger className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Avg Hold</p>
                            <p className="font-semibold text-slate-700 dark:text-slate-200">{personaData.stats.avgHoldingDays}d</p>
                          </TooltipTrigger>
                          <TooltipContent>Average days holding a position</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Win Rate</p>
                            <p className="font-semibold text-slate-700 dark:text-slate-200">{(personaData.stats.winRate * 100).toFixed(0)}%</p>
                          </TooltipTrigger>
                          <TooltipContent>Percentage of profitable trades</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Turnover</p>
                            <p className="font-semibold text-slate-700 dark:text-slate-200">{(personaData.stats.turnoverRate * 100).toFixed(0)}%</p>
                          </TooltipTrigger>
                          <TooltipContent>Portfolio turnover rate</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Panic Sells</p>
                            <p className="font-semibold text-slate-700 dark:text-slate-200">{(personaData.stats.panicSellRatio * 100).toFixed(0)}%</p>
                          </TooltipTrigger>
                          <TooltipContent>Ratio of panic selling behavior</TooltipContent>
                        </Tooltip>
                      </div>

                      <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                        <p className="text-sm text-center text-slate-700 dark:text-slate-200">{personaData.advice}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>

            {/* Sample Data Info */}
            <section className="max-w-2xl mx-auto">
              <Card glass className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-slate-900 dark:text-white">Sample Transactions Used</CardTitle>
                  <CardDescription>Demo data for analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="px-3 py-2 text-left text-slate-500 dark:text-slate-400 font-medium">Date</th>
                          <th className="px-3 py-2 text-left text-slate-500 dark:text-slate-400 font-medium">Symbol</th>
                          <th className="px-3 py-2 text-left text-slate-500 dark:text-slate-400 font-medium">Action</th>
                          <th className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 font-medium">Qty</th>
                          <th className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 font-medium">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SAMPLE_TRANSACTIONS.map((t, i) => (
                          <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                            <td className="px-3 py-2 tabular-nums text-slate-700 dark:text-slate-300">{t.date}</td>
                            <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">{t.symbol}</td>
                            <td className={`px-3 py-2 ${t.action === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                              {t.action}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">{t.quantity}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">${t.price.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Footer */}
            <footer className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
              <p>Data updated: {weatherData ? new Date(weatherData.timestamp).toLocaleString() : 'N/A'}</p>
              <p className="mt-1">Powered by Yahoo Finance API</p>
            </footer>
          </div>
        )}
      </main>
    </div>
  )
}
