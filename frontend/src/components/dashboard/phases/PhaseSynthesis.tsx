'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, TrendingUp, TrendingDown, ChevronRight, Brain, FileSpreadsheet } from 'lucide-react'
import { StockNews } from '@/components/StockNews'
import { StockIndicators } from '@/components/StockIndicators'
import { TechnicalIndicators } from '@/components/TechnicalIndicators'
import { PeerStocks } from '@/components/PeerStocks'
import { FinancialStatements } from '@/components/FinancialStatements'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { StockAnalysisResponse } from '@/lib/api-client'

interface PhaseSynthesisProps {
  stockData: StockAnalysisResponse | null
  loading: boolean
}

export function PhaseSynthesis({ stockData, loading }: PhaseSynthesisProps) {
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)
  const [financialsOpen, setFinancialsOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
        <p className="text-white/60">Analyzing stock...</p>
      </div>
    )
  }

  if (!stockData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white/30 text-lg">Search a ticker to begin</p>
      </div>
    )
  }

  const isPositive = stockData.indicators.change >= 0
  const range52w = stockData.indicators.fiftyTwoWeekHigh - stockData.indicators.fiftyTwoWeekLow
  const positionIn52w = range52w > 0
    ? ((stockData.indicators.price - stockData.indicators.fiftyTwoWeekLow) / range52w) * 100
    : 50

  const circumference = 2 * Math.PI * 42
  const strokeOffset = circumference - (positionIn52w / 100) * circumference

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-6">
      {/* Left hover zone trigger */}
      <div
        className="fixed left-0 top-0 w-16 h-full z-30"
        onMouseEnter={() => setLeftOpen(true)}
      />
      {/* Right hover zone trigger */}
      <div
        className="fixed right-0 top-0 w-16 h-full z-30"
        onMouseEnter={() => setRightOpen(true)}
      />

      {/* Left panel - News + AI */}
      <AnimatePresence>
        {leftOpen && (
          <motion.div
            className="fixed left-0 top-0 h-full w-[400px] z-40 overflow-y-auto p-6 pt-20"
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onMouseLeave={() => setLeftOpen(false)}
            style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)' }}
          >
            <div className="space-y-6">
              <StockNews news={stockData.news} />
              <Card glass>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <CardTitle className="text-lg text-white">AI Analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                    stockData.analysis.recommendation === 'BUY'
                      ? 'bg-green-900/30 text-green-400'
                      : stockData.analysis.recommendation === 'SELL'
                        ? 'bg-red-900/30 text-red-400'
                        : 'bg-blue-900/30 text-blue-400'
                  }`}>
                    {stockData.analysis.recommendation}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {stockData.analysis.summary}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {stockData.analysis.reasoning}
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right panel - Technicals + Indicators */}
      <AnimatePresence>
        {rightOpen && (
          <motion.div
            className="fixed right-0 top-0 h-full w-[400px] z-40 overflow-y-auto p-6 pt-20"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onMouseLeave={() => setRightOpen(false)}
            style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)' }}
          >
            <div className="space-y-6">
              <StockIndicators
                symbol={stockData.symbol}
                name={stockData.name}
                indicators={stockData.indicators}
              />
              {stockData.technicalIndicators && (
                <TechnicalIndicators technicals={stockData.technicalIndicators} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center content */}
      <motion.div
        className="text-center max-w-lg z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          className="text-7xl font-bold text-white mb-2 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {stockData.symbol}
        </motion.h2>

        <motion.p
          className="text-white/50 text-sm mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {stockData.name}
        </motion.p>

        {/* Price */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-4xl font-bold text-white tabular-nums">
            ${stockData.indicators.price.toFixed(2)}
          </p>
          <div className={`flex items-center justify-center gap-2 mt-2 ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span className="text-lg font-semibold tabular-nums">
              {isPositive ? '+' : ''}{stockData.indicators.change.toFixed(2)} ({isPositive ? '+' : ''}{stockData.indicators.changePercent.toFixed(2)}%)
            </span>
          </div>
        </motion.div>

        {/* 52-week ring */}
        <motion.div
          className="relative inline-block mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <svg width="120" height="120" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke={isPositive ? '#34d399' : '#f87171'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              transform="rotate(-90 50 50)"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: strokeOffset }}
              transition={{ duration: 1.2, delay: 0.8 }}
            />
            <text x="50" y="48" textAnchor="middle" className="fill-white text-[10px] font-semibold">
              {positionIn52w.toFixed(0)}%
            </text>
            <text x="50" y="60" textAnchor="middle" className="fill-white/40 text-[6px]">
              52W Range
            </text>
          </svg>
        </motion.div>

        {/* Edge hints */}
        <motion.div
          className="flex justify-between text-xs text-white/25 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3 rotate-180" /> News & AI
          </span>
          <span className="flex items-center gap-1">
            Technicals <ChevronRight className="w-3 h-3" />
          </span>
        </motion.div>

        {/* Financials button */}
        {stockData.financials && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <Button
              variant="ghost"
              className="text-white/40 hover:text-white/70"
              onClick={() => setFinancialsOpen(!financialsOpen)}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              View Financials
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Bottom peer strip */}
      {stockData.peerStocks && stockData.peerStocks.length > 0 && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-20 overflow-x-auto"
          style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)' }}
          initial={{ y: 60 }}
          animate={{ y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="flex gap-6 px-6 py-3 min-w-max">
            {stockData.peerStocks.map((peer) => {
              const peerPositive = peer.change >= 0
              return (
                <div key={peer.symbol} className="flex items-center gap-3 text-sm">
                  <span className="font-semibold text-white/70">{peer.symbol}</span>
                  <span className="text-white/50 tabular-nums">${peer.price.toFixed(2)}</span>
                  <span className={`tabular-nums text-xs ${peerPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {peerPositive ? '+' : ''}{peer.changePercent.toFixed(2)}%
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Financials Drawer */}
      <AnimatePresence>
        {financialsOpen && stockData.financials && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setFinancialsOpen(false)}
            />
            <motion.div
              className="relative w-full max-w-4xl max-h-[70vh] overflow-y-auto rounded-t-3xl p-6"
              style={{ background: 'rgba(15, 23, 42, 0.98)', backdropFilter: 'blur(20px)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              <FinancialStatements financials={stockData.financials} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
