'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2, AlertTriangle } from 'lucide-react'

interface PhaseInputProps {
  onSearch: (symbol: string) => void
  loading: boolean
  error: string | null
}

export function PhaseInput({ onSearch, loading, error }: PhaseInputProps) {
  const [symbol, setSymbol] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = symbol.trim()
    if (trimmed.length > 0) {
      onSearch(trimmed)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-6">
      <motion.p
        className="text-white/60 text-lg mb-8 tracking-wide"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        What are you watching?
      </motion.p>

      <motion.form
        onSubmit={handleSubmit}
        className="w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/30" />
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter a ticker..."
            maxLength={10}
            disabled={loading}
            className="w-full h-16 pl-16 pr-16 bg-transparent border-0 border-b-2 border-white/20 text-white text-2xl font-light placeholder:text-white/20 focus:outline-none focus:border-white/50 transition-colors"
            autoFocus
          />
          {loading && (
            <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/50 animate-spin" />
          )}
        </div>

        <motion.div
          className="h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent mt-0"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: symbol.length > 0 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.form>

      {error && (
        <motion.div
          className="mt-6 flex items-center gap-2 text-red-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </motion.div>
      )}

      <motion.p
        className="mt-12 text-white/20 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Press Enter to analyze
      </motion.p>
    </div>
  )
}
