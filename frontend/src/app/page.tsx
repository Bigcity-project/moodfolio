'use client'

import Link from 'next/link'
import { Cloud, BarChart3, Brain, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { MoodOrb } from '@/components/MoodOrb'

const features = [
  {
    icon: Cloud,
    title: 'Market Weather',
    description: 'Real-time mood score based on VIX and RSI indicators. Know when the market is sunny or stormy.',
    gradient: 'from-yellow-400 to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'Stock Analysis',
    description: 'Search any US stock ticker to get key indicators, 52-week ranges, and the latest Yahoo Finance news.',
    gradient: 'from-blue-400 to-cyan-500',
  },
  {
    icon: Brain,
    title: 'AI Insights',
    description: 'Get AI-powered analysis with buy/hold/sell recommendations and reasoning for any stock.',
    gradient: 'from-purple-400 to-pink-500',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-lg text-slate-900 dark:text-white">Moodfolio</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-28 pb-16">
        {/* Hero Content */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <MoodOrb moodScore={72} weatherType="SUNNY" size="lg" showEmoji={false} />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Investment Decision Support
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
            Understand market sentiment, analyze individual stocks,
            and get AI-powered insights to make smarter investment decisions.
          </p>

          <Button asChild size="lg" className="group">
            <Link href="/dashboard">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => (
            <Card key={feature.title} glass className="h-full group hover:-translate-y-2 transition-transform duration-200">
              <CardContent className="p-6">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-16">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Powered by real-time Yahoo Finance data
          </p>
          <div className="flex items-center justify-center gap-4 text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Data
            </span>
            <span>•</span>
            <span className="text-sm">Stock Analysis</span>
            <span>•</span>
            <span className="text-sm">AI Insights</span>
          </div>
        </div>
      </main>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
