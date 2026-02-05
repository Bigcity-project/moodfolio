'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Cloud, BarChart3, User, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { MoodOrb } from '@/components/MoodOrb'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
}

const features = [
  {
    icon: Cloud,
    title: 'Market Weather',
    description: 'Real-time mood score based on VIX and RSI indicators. Know when the market is sunny or stormy.',
    gradient: 'from-yellow-400 to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'Do-Nothing Simulator',
    description: 'Compare your trading performance against a simple buy-and-hold SPY strategy.',
    gradient: 'from-blue-400 to-cyan-500',
  },
  {
    icon: User,
    title: 'Portfolio Persona',
    description: 'Discover your investor personality based on your trading patterns and behavior.',
    gradient: 'from-purple-400 to-pink-500',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg">Moodfolio</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 pt-24 pb-16"
      >
        {/* Hero Content */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <MoodOrb moodScore={72} weatherType="SUNNY" size="lg" showEmoji={false} />
          </div>

          <motion.h1
            variants={itemVariants}
            className="text-title text-foreground mb-4"
          >
            Investment Decision Support
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-subtitle text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Understand market sentiment, analyze your trading behavior,
            and make smarter investment decisions with AI-powered insights.
          </motion.p>

          <motion.div variants={itemVariants}>
            <Button asChild size="lg" className="group">
              <Link href="/dashboard">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={itemVariants}
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card glass className="h-full overflow-hidden group cursor-pointer">
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-body text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-16"
        >
          <p className="text-caption text-muted-foreground mb-4">
            Powered by real-time Yahoo Finance data
          </p>
          <div className="flex items-center justify-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Data
            </span>
            <span className="text-border">•</span>
            <span className="text-sm">VIX & RSI Indicators</span>
            <span className="text-border">•</span>
            <span className="text-sm">Portfolio Analysis</span>
          </div>
        </motion.div>
      </motion.main>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
