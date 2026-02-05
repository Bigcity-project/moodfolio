import Link from 'next/link'
import { Cloud, BarChart3, User, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Moodfolio
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your investment decision support system. Understand market sentiment,
            analyze your trading behavior, and make smarter decisions.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <FeatureCard
            icon={<Cloud className="w-8 h-8" />}
            title="Market Weather"
            description="Get a real-time mood score based on VIX and RSI indicators. Know when the market is sunny or stormy."
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Do-Nothing Simulator"
            description="Compare your trading performance against a simple buy-and-hold strategy. See if your trades added value."
          />
          <FeatureCard
            icon={<User className="w-8 h-8" />}
            title="Portfolio Persona"
            description="Discover your investor personality based on your trading patterns. Are you a HODLer or a Day Trader?"
          />
        </div>

        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="bg-blue-100 rounded-full p-3 w-fit mb-4 text-blue-600">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
