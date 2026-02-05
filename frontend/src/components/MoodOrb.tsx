'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type WeatherType = 'SUNNY' | 'CLOUDY' | 'RAINY' | 'STORMY'

interface MoodOrbProps {
  moodScore: number
  weatherType: WeatherType
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showScore?: boolean
  showEmoji?: boolean
}

const weatherConfig = {
  SUNNY: {
    gradient: 'from-yellow-400 via-orange-400 to-amber-500',
    glow: 'shadow-[0_0_80px_30px_rgba(251,191,36,0.4)]',
    emoji: '☀️',
    label: 'Sunny',
  },
  CLOUDY: {
    gradient: 'from-slate-400 via-gray-400 to-zinc-500',
    glow: 'shadow-[0_0_80px_30px_rgba(148,163,184,0.3)]',
    emoji: '⛅',
    label: 'Cloudy',
  },
  RAINY: {
    gradient: 'from-blue-400 via-sky-500 to-cyan-600',
    glow: 'shadow-[0_0_80px_30px_rgba(56,189,248,0.4)]',
    emoji: '🌧️',
    label: 'Rainy',
  },
  STORMY: {
    gradient: 'from-purple-600 via-violet-700 to-slate-800',
    glow: 'shadow-[0_0_80px_30px_rgba(139,92,246,0.4)]',
    emoji: '⛈️',
    label: 'Stormy',
  },
}

const sizeConfig = {
  sm: {
    container: 'w-20 h-20',
    score: 'text-2xl',
    emoji: 'text-3xl',
    ring: 'w-24 h-24',
  },
  md: {
    container: 'w-32 h-32',
    score: 'text-4xl',
    emoji: 'text-4xl',
    ring: 'w-40 h-40',
  },
  lg: {
    container: 'w-48 h-48',
    score: 'text-6xl',
    emoji: 'text-5xl',
    ring: 'w-56 h-56',
  },
  xl: {
    container: 'w-64 h-64',
    score: 'text-7xl',
    emoji: 'text-6xl',
    ring: 'w-72 h-72',
  },
}

export function MoodOrb({
  moodScore,
  weatherType,
  size = 'lg',
  showScore = true,
  showEmoji = true,
}: MoodOrbProps) {
  const config = weatherConfig[weatherType]
  const sizeClasses = sizeConfig[size]

  // Pulse speed based on mood (higher mood = slower, calmer pulse)
  const pulseSpeed = 3 + (moodScore / 50)

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring */}
      <motion.div
        className={cn(
          'absolute rounded-full opacity-30',
          sizeClasses.ring,
          `bg-gradient-to-br ${config.gradient}`
        )}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: pulseSpeed + 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main orb with float animation */}
      <motion.div
        className={cn(
          'relative rounded-full bg-gradient-to-br',
          config.gradient,
          config.glow,
          sizeClasses.container
        )}
        animate={{
          y: [0, -12, 0],
          rotate: [0, 2, 0, -2, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{
          y: {
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          },
          rotate: {
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          },
          scale: {
            duration: pulseSpeed,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
      >
        {/* Inner shine effect */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showEmoji && (
            <motion.span
              className={cn('mb-1', sizeClasses.emoji)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              {config.emoji}
            </motion.span>
          )}
          {showScore && (
            <motion.span
              className={cn(
                'font-bold text-white drop-shadow-lg',
                sizeClasses.score
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {moodScore}
            </motion.span>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// Helper function to get interpretation based on score
export function getMoodInterpretation(score: number, weatherType: WeatherType): string {
  const config = weatherConfig[weatherType]

  if (score >= 70) {
    return `${config.emoji} Market sentiment is ${config.label.toLowerCase()}. Investors are feeling optimistic.`
  } else if (score >= 50) {
    return `${config.emoji} Market sentiment is ${config.label.toLowerCase()}. Proceed with balanced caution.`
  } else if (score >= 30) {
    return `${config.emoji} Market sentiment is ${config.label.toLowerCase()}. Consider defensive positions.`
  } else {
    return `${config.emoji} Market sentiment is ${config.label.toLowerCase()}. High uncertainty - stay alert.`
  }
}
