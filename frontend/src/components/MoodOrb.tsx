'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MoodOrbProps {
  moodScore: number
  weatherType: 'SUNNY' | 'CLOUDY' | 'RAINY' | 'STORMY'
  size?: 'sm' | 'md' | 'lg'
}

const weatherColors = {
  SUNNY: {
    primary: 'from-yellow-400 to-orange-500',
    glow: 'shadow-yellow-400/50',
    bg: 'bg-gradient-to-br from-yellow-100 to-orange-100',
  },
  CLOUDY: {
    primary: 'from-gray-300 to-gray-500',
    glow: 'shadow-gray-400/50',
    bg: 'bg-gradient-to-br from-gray-100 to-gray-200',
  },
  RAINY: {
    primary: 'from-blue-400 to-blue-600',
    glow: 'shadow-blue-400/50',
    bg: 'bg-gradient-to-br from-blue-100 to-blue-200',
  },
  STORMY: {
    primary: 'from-purple-600 to-gray-800',
    glow: 'shadow-purple-500/50',
    bg: 'bg-gradient-to-br from-purple-100 to-gray-200',
  },
}

const sizeClasses = {
  sm: 'w-24 h-24',
  md: 'w-40 h-40',
  lg: 'w-56 h-56',
}

export function MoodOrb({ moodScore, weatherType, size = 'md' }: MoodOrbProps) {
  const colors = weatherColors[weatherType]
  const pulseSpeed = Math.max(1, 4 - (moodScore / 33))

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className={cn(
          'rounded-full bg-gradient-to-br',
          colors.primary,
          sizeClasses[size],
          'shadow-2xl',
          colors.glow
        )}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: pulseSpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-bold text-white drop-shadow-lg">
          {moodScore}
        </span>
      </div>
    </div>
  )
}
