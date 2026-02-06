'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MoodOrb, getMoodInterpretation, type WeatherType } from '@/components/MoodOrb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { TickerSearch } from '@/components/TickerSearch'
import { StockIndicators } from '@/components/StockIndicators'
import { StockNews } from '@/components/StockNews'
import {
  api,
  type MarketWeatherResponse,
  type StockAnalysisResponse,
} from '@/lib/api-client'
import {
  Loader2,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Cloud,
  RefreshCw,
  Brain,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'

export default function Dashboard() {
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const [weatherData, setWeatherData] = useState<MarketWeatherResponse | null>(null)

  const [stockLoading, setStockLoading] = useState(false)
  const [stockError, setStockError] = useState<string | null>(null)
  const [stockData, setStockData] = useState<StockAnalysisResponse | null>(null)

  useEffect(() => {
    fetchWeather()
  }, [])

  async function fetchWeather() {
    setWeatherLoading(true)
    setWeatherError(null)
    try {
      const weather = await api.getMarketWeather()
      setWeatherData(weather)
    } catch (err) {
      setWeatherError(err instanceof Error ? err.message : 'Failed to fetch market data.')
    } finally {
      setWeatherLoading(false)
    }
  }

  async function handleSearch(symbol: string) {
    setStockLoading(true)
    setStockError(null)
    setStockData(null)
    try {
      const data = await api.getStockAnalysis(symbol)
      setStockData(data)
    } catch (err) {
      setStockError(err instanceof Error ? err.message : 'Failed to fetch stock data.')
    } finally {
      setStockLoading(false)
    }
  }

  const TrendIcon = weatherData?.trend === 'UP' ? TrendingUp : weatherData?.trend === 'DOWN' ? TrendingDown : Minus

  const recommendationConfig = {
    BUY: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: TrendingUp },
    HOLD: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: ShieldCheck },
    SELL: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: TrendingDown },
  }

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
                <Button variant="ghost" size="icon" onClick={fetchWeather} disabled={weatherLoading}>
                  <RefreshCw className={`w-5 h-5 ${weatherLoading ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh market data</TooltipContent>
            </Tooltip>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Market Weather Section */}
        {weatherLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="text-slate-600 dark:text-slate-300">Loading market data...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {weatherError && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-2xl mb-8 max-w-md mx-auto text-center">
                {weatherError}
              </div>
            )}

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

            {/* Market Factors Card */}
            {weatherData && (
              <section className="max-w-md mx-auto">
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
              </section>
            )}

            <Separator className="max-w-2xl mx-auto bg-slate-200 dark:bg-slate-700" />

            {/* Ticker Search Section */}
            <section className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Stock Analysis</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Enter a US stock ticker to get indicators, news, and AI analysis</p>
              <TickerSearch onSearch={handleSearch} loading={stockLoading} />
            </section>

            {/* Stock Loading */}
            {stockLoading && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-400" />
                <p className="text-slate-600 dark:text-slate-300">Analyzing stock...</p>
              </div>
            )}

            {/* Stock Error */}
            {stockError && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-2xl max-w-md mx-auto text-center flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {stockError}
              </div>
            )}

            {/* Stock Results */}
            {stockData && !stockLoading && (
              <>
                {/* Indicators + News - two column */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StockIndicators
                    symbol={stockData.symbol}
                    name={stockData.name}
                    indicators={stockData.indicators}
                  />
                  <StockNews news={stockData.news} />
                </section>

                {/* Stock Analysis Result */}
                <section className="max-w-2xl mx-auto">
                  <Card glass className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                          <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <CardTitle className="text-lg text-slate-900 dark:text-white">AI Analysis</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Recommendation Badge */}
                      <div className="flex justify-center">
                        {(() => {
                          const rec = stockData.analysis.recommendation
                          const config = recommendationConfig[rec] ?? recommendationConfig.HOLD
                          const RecIcon = config.icon
                          return (
                            <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full ${config.color}`}>
                              <RecIcon className="w-4 h-4" />
                              {rec}
                            </span>
                          )
                        })()}
                      </div>

                      {/* Summary */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                          {stockData.analysis.summary}
                        </p>
                      </div>

                      {/* Reasoning */}
                      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Reasoning</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                          {stockData.analysis.reasoning}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </>
            )}

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
