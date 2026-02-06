'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, TrendingDown } from 'lucide-react'
import type { PeerStockDto } from '@/lib/api-client'

interface PeerStocksProps {
  peers: PeerStockDto[]
}

export function PeerStocks({ peers }: PeerStocksProps) {
  if (peers.length === 0) return null

  return (
    <Card glass className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-lg text-slate-900 dark:text-white">Related Stocks</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {peers.map((peer) => {
          const isPositive = peer.change >= 0
          const Icon = isPositive ? TrendingUp : TrendingDown
          return (
            <div
              key={peer.symbol}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{peer.symbol}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{peer.name}</p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                  ${peer.price.toFixed(2)}
                </p>
                <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  <Icon className="w-3 h-3" />
                  <span className="text-xs font-semibold tabular-nums">
                    {isPositive ? '+' : ''}{peer.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
