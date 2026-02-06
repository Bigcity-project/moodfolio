'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export function useSnapScroll(phaseCount: number) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activePhase, setActivePhase] = useState(1)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const sections = container.querySelectorAll<HTMLElement>('[data-phase]')
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const phase = Number(entry.target.getAttribute('data-phase'))
            if (phase >= 1 && phase <= phaseCount) {
              setActivePhase(phase)
            }
          }
        }
      },
      {
        root: container,
        threshold: 0.5,
      }
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [phaseCount])

  const scrollToPhase = useCallback((phase: number) => {
    const container = containerRef.current
    if (!container) return

    const target = container.querySelector<HTMLElement>(`[data-phase="${phase}"]`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  return { containerRef, activePhase, scrollToPhase }
}
