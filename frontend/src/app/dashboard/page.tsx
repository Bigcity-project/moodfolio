'use client'

import { useState, useEffect } from 'react'
import { MoodCard } from '@/components/MoodCard'
import { DoNothingSimulator } from '@/components/DoNothingSimulator'
import { PersonaCard } from '@/components/PersonaCard'
import { api, type MarketWeatherResponse, type DoNothingSimulationResponse, type PersonaAnalysisResponse, type TransactionDto } from '@/lib/api-client'
import { Loader2, ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'

const SAMPLE_TRANSACTIONS: TransactionDto[] = [
  { date: '2024-01-15', symbol: 'AAPL', action: 'BUY', quantity: 10, price: 185.50 },
  { date: '2024-02-20', symbol: 'AAPL', action: 'SELL', quantity: 5, price: 175.00 },
  { date: '2024-03-10', symbol: 'MSFT', action: 'BUY', quantity: 8, price: 410.25 },
  { date: '2024-04-05', symbol: 'GOOGL', action: 'BUY', quantity: 15, price: 155.75 },
  { date: '2024-05-15', symbol: 'MSFT', action: 'SELL', quantity: 4, price: 395.00 },
  { date: '2024-06-01', symbol: 'NVDA', action: 'BUY', quantity: 5, price: 1100.00 },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'weather' | 'simulator' | 'persona'>('weather')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [weatherData, setWeatherData] = useState<MarketWeatherResponse | null>(null)
  const [simulationData, setSimulationData] = useState<DoNothingSimulationResponse | null>(null)
  const [personaData, setPersonaData] = useState<PersonaAnalysisResponse | null>(null)

  useEffect(() => {
    if (activeTab === 'weather' && !weatherData) {
      fetchWeather()
    }
  }, [activeTab, weatherData])

  async function fetchWeather() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getMarketWeather()
      setWeatherData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market weather')
    } finally {
      setLoading(false)
    }
  }

  async function runSimulation() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.runDoNothingSimulation(SAMPLE_TRANSACTIONS)
      setSimulationData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run simulation')
    } finally {
      setLoading(false)
    }
  }

  async function analyzePersona() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.analyzePersona(SAMPLE_TRANSACTIONS)
      setPersonaData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze persona')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Moodfolio Dashboard</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center gap-4 mb-8">
          <TabButton
            active={activeTab === 'weather'}
            onClick={() => setActiveTab('weather')}
          >
            Market Weather
          </TabButton>
          <TabButton
            active={activeTab === 'simulator'}
            onClick={() => {
              setActiveTab('simulator')
              if (!simulationData) runSimulation()
            }}
          >
            Do-Nothing Simulator
          </TabButton>
          <TabButton
            active={activeTab === 'persona'}
            onClick={() => {
              setActiveTab('persona')
              if (!personaData) analyzePersona()
            }}
          >
            Portfolio Persona
          </TabButton>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8 max-w-md mx-auto">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        ) : (
          <div className="flex justify-center">
            {activeTab === 'weather' && weatherData && (
              <MoodCard data={weatherData} />
            )}

            {activeTab === 'simulator' && simulationData && (
              <div className="max-w-4xl w-full">
                <DoNothingSimulator data={simulationData} />
              </div>
            )}

            {activeTab === 'persona' && personaData && (
              <div className="max-w-lg w-full">
                <PersonaCard data={personaData} />
              </div>
            )}
          </div>
        )}

        {activeTab !== 'weather' && (
          <div className="mt-8 bg-white rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Upload className="w-5 h-5" />
              <span className="font-medium">Sample Transactions Used</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Symbol</th>
                    <th className="px-4 py-2 text-left">Action</th>
                    <th className="px-4 py-2 text-right">Qty</th>
                    <th className="px-4 py-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_TRANSACTIONS.map((t, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-2">{t.date}</td>
                      <td className="px-4 py-2 font-medium">{t.symbol}</td>
                      <td className={`px-4 py-2 ${t.action === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.action}
                      </td>
                      <td className="px-4 py-2 text-right">{t.quantity}</td>
                      <td className="px-4 py-2 text-right">${t.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-full font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}
