'use client'

import { motion } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const PHASE_LABELS = [
  'The Input',
  'The Synthesis',
  'The Verdict',
  'Strategy',
  'Simulation',
]

interface PhaseNavigationProps {
  activePhase: number
  onNavigate: (phase: number) => void
  maxPhase: number
}

export function PhaseNavigation({ activePhase, onNavigate, maxPhase }: PhaseNavigationProps) {
  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      {PHASE_LABELS.map((label, i) => {
        const phase = i + 1
        const isActive = phase === activePhase
        const isReachable = phase <= maxPhase

        return (
          <Tooltip key={phase}>
            <TooltipTrigger asChild>
              <button
                onClick={() => isReachable && onNavigate(phase)}
                disabled={!isReachable}
                className="relative group"
                aria-label={`Go to ${label}`}
              >
                <motion.div
                  className={`w-3 h-3 rounded-full border-2 transition-colors ${
                    isActive
                      ? 'bg-white border-white shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                      : isReachable
                        ? 'border-white/40 bg-transparent group-hover:border-white/70'
                        : 'border-white/15 bg-transparent cursor-not-allowed'
                  }`}
                  animate={isActive ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-slate-900 text-white border-slate-700">
              {label}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </nav>
  )
}
