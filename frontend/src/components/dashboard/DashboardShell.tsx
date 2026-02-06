'use client'

import { useEffect, useMemo } from 'react'
import { useDashboardState } from '@/hooks/useDashboardState'
import { useSnapScroll } from '@/hooks/useSnapScroll'
import { PhaseNavigation } from './PhaseNavigation'
import { ParticleBackground } from './ParticleBackground'
import { PhaseInput } from './phases/PhaseInput'
import { PhaseSynthesis } from './phases/PhaseSynthesis'
import { PhaseVerdict } from './phases/PhaseVerdict'
import { PhaseStrategy } from './phases/PhaseStrategy'
import { PhaseSimulation } from './phases/PhaseSimulation'
import type { Stance, StrategyCard } from '@/lib/dashboard-types'

export function DashboardShell() {
  const {
    state,
    fetchWeather,
    searchStock,
    setStance,
    setSelectedStrategy,
    setActivePhase,
  } = useDashboardState()

  const { containerRef, activePhase, scrollToPhase } = useSnapScroll(5)

  useEffect(() => {
    fetchWeather()
  }, [fetchWeather])

  useEffect(() => {
    setActivePhase(activePhase)
  }, [activePhase, setActivePhase])

  const maxPhase = useMemo(() => {
    if (!state.stockData) return 1
    if (!state.stance) return 3
    if (!state.selectedStrategy) return 4
    return 5
  }, [state.stockData, state.stance, state.selectedStrategy])

  function handleSearch(symbol: string) {
    searchStock(symbol).then(() => {
      setTimeout(() => scrollToPhase(2), 800)
    })
  }

  function handleStanceSelect(stance: Stance) {
    setStance(stance)
    setTimeout(() => scrollToPhase(4), 600)
  }

  function handleStrategySelect(strategy: StrategyCard) {
    setSelectedStrategy(strategy)
    setTimeout(() => scrollToPhase(5), 600)
  }

  const stanceColor = state.stance === 'bullish'
    ? 'var(--stance-bullish-rgb)'
    : state.stance === 'bearish'
      ? 'var(--stance-bearish-rgb)'
      : undefined

  return (
    <div
      className="dashboard-dark"
      style={stanceColor ? { '--stance-color-rgb': stanceColor } as React.CSSProperties : undefined}
    >
      <ParticleBackground
        activePhase={state.activePhase}
        stance={state.stance}
        stockLoading={state.stockLoading}
      />

      <PhaseNavigation
        activePhase={state.activePhase}
        onNavigate={scrollToPhase}
        maxPhase={maxPhase}
      />

      <div
        ref={containerRef}
        className="h-screen overflow-y-auto snap-y snap-mandatory"
      >
        <section data-phase="1" className="h-screen snap-start snap-always flex items-center justify-center relative">
          <PhaseInput
            onSearch={handleSearch}
            loading={state.stockLoading}
            error={state.stockError}
          />
        </section>

        <section data-phase="2" className="min-h-screen snap-start snap-always relative">
          <PhaseSynthesis
            stockData={state.stockData}
            loading={state.stockLoading}
          />
        </section>

        {state.stockData && (
          <section data-phase="3" className="h-screen snap-start snap-always flex items-center justify-center relative">
            <PhaseVerdict
              stockData={state.stockData}
              stance={state.stance}
              onStanceSelect={handleStanceSelect}
            />
          </section>
        )}

        {state.stockData && state.stance && (
          <section data-phase="4" className="h-screen snap-start snap-always flex items-center justify-center relative">
            <PhaseStrategy
              stockData={state.stockData}
              stance={state.stance}
              selectedStrategy={state.selectedStrategy}
              onStrategySelect={handleStrategySelect}
            />
          </section>
        )}

        {state.stockData && state.stance && state.selectedStrategy && (
          <section data-phase="5" className="min-h-screen snap-start snap-always flex items-center justify-center relative">
            <PhaseSimulation
              stockData={state.stockData}
              strategy={state.selectedStrategy}
              stance={state.stance}
            />
          </section>
        )}
      </div>
    </div>
  )
}
