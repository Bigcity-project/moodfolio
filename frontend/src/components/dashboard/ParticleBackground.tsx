'use client'

import { useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Stance } from '@/lib/dashboard-types'

interface Particle {
  id: number
  cx: number
  cy: number
  r: number
  delay: number
  duration: number
  dx: number
  dy: number
}

interface ParticleBackgroundProps {
  activePhase: number
  stance: Stance | null
  stockLoading: boolean
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    cx: Math.random() * 100,
    cy: Math.random() * 100,
    r: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 8 + 6,
    dx: (Math.random() - 0.5) * 20,
    dy: (Math.random() - 0.5) * 20,
  }))
}

export function ParticleBackground({ activePhase, stance, stockLoading }: ParticleBackgroundProps) {
  const particlesRef = useRef<Particle[]>(generateParticles(50))
  const particles = particlesRef.current

  const fillColor = useMemo(() => {
    if (stance === 'bullish') return 'rgba(45, 212, 191, 0.3)'
    if (stance === 'bearish') return 'rgba(251, 146, 60, 0.3)'
    return 'rgba(147, 197, 253, 0.2)'
  }, [stance])

  const converge = stockLoading

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {particles.map((p) => (
          <motion.circle
            key={p.id}
            cx={p.cx}
            cy={p.cy}
            r={p.r}
            fill={fillColor}
            initial={{ cx: p.cx, cy: p.cy, opacity: 0.3 }}
            animate={
              converge
                ? { cx: 50, cy: 50, opacity: 0.6, r: p.r * 0.5 }
                : {
                    cx: [p.cx, p.cx + p.dx, p.cx],
                    cy: [p.cy, p.cy + p.dy, p.cy],
                    opacity: [0.2, 0.5, 0.2],
                  }
            }
            transition={
              converge
                ? { duration: 0.8, type: 'spring', stiffness: 60 }
                : {
                    duration: p.duration,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: 'easeInOut',
                  }
            }
          />
        ))}
      </svg>
    </div>
  )
}
