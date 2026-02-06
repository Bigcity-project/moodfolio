'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search, Loader2 } from 'lucide-react'

interface TickerSearchProps {
  onSearch: (symbol: string) => void
  loading: boolean
}

export function TickerSearch({ onSearch, loading }: TickerSearchProps) {
  const [symbol, setSymbol] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = symbol.trim()
    if (trimmed.length > 0) {
      onSearch(trimmed)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 w-full max-w-md mx-auto">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter ticker (e.g. AAPL)"
          maxLength={10}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          disabled={loading}
        />
      </div>
      <Button type="submit" disabled={loading || symbol.trim().length === 0}>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          'Analyze'
        )}
      </Button>
    </form>
  )
}
