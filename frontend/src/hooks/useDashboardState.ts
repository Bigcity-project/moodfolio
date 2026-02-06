'use client'

import { useReducer, useCallback } from 'react'
import {
  api,
  type MarketWeatherResponse,
  type StockAnalysisResponse,
} from '@/lib/api-client'
import type { DashboardState, DashboardAction, Stance, StrategyCard } from '@/lib/dashboard-types'

const initialState: DashboardState = {
  weatherData: null,
  weatherLoading: true,
  weatherError: null,
  stockData: null,
  stockLoading: false,
  stockError: null,
  stance: null,
  selectedStrategy: null,
  activePhase: 1,
}

function reducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_WEATHER_LOADING':
      return { ...state, weatherLoading: true, weatherError: null }
    case 'SET_WEATHER_DATA':
      return { ...state, weatherLoading: false, weatherData: action.payload }
    case 'SET_WEATHER_ERROR':
      return { ...state, weatherLoading: false, weatherError: action.payload }
    case 'SET_STOCK_LOADING':
      return { ...state, stockLoading: true, stockError: null, stockData: null }
    case 'SET_STOCK_DATA':
      return { ...state, stockLoading: false, stockData: action.payload }
    case 'SET_STOCK_ERROR':
      return { ...state, stockLoading: false, stockError: action.payload }
    case 'SET_STANCE':
      return { ...state, stance: action.payload, selectedStrategy: null }
    case 'SET_SELECTED_STRATEGY':
      return { ...state, selectedStrategy: action.payload }
    case 'SET_ACTIVE_PHASE':
      return { ...state, activePhase: action.payload }
    case 'RESET_STOCK':
      return { ...state, stockData: null, stockError: null, stance: null, selectedStrategy: null }
    default:
      return state
  }
}

export function useDashboardState() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const fetchWeather = useCallback(async () => {
    dispatch({ type: 'SET_WEATHER_LOADING' })
    try {
      const weather = await api.getMarketWeather()
      dispatch({ type: 'SET_WEATHER_DATA', payload: weather })
    } catch (err) {
      dispatch({
        type: 'SET_WEATHER_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to fetch market data.',
      })
    }
  }, [])

  const searchStock = useCallback(async (symbol: string) => {
    dispatch({ type: 'SET_STOCK_LOADING' })
    try {
      const data = await api.getStockAnalysis(symbol)
      dispatch({ type: 'SET_STOCK_DATA', payload: data })
    } catch (err) {
      dispatch({
        type: 'SET_STOCK_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to fetch stock data.',
      })
    }
  }, [])

  const setStance = useCallback((stance: Stance) => {
    dispatch({ type: 'SET_STANCE', payload: stance })
  }, [])

  const setSelectedStrategy = useCallback((strategy: StrategyCard) => {
    dispatch({ type: 'SET_SELECTED_STRATEGY', payload: strategy })
  }, [])

  const setActivePhase = useCallback((phase: number) => {
    dispatch({ type: 'SET_ACTIVE_PHASE', payload: phase })
  }, [])

  return {
    state,
    fetchWeather,
    searchStock,
    setStance,
    setSelectedStrategy,
    setActivePhase,
  }
}
