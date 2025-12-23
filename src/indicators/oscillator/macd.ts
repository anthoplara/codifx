/**
 * MACD (Moving Average Convergence Divergence)
 */

import type { OHLCV } from "../../types/index.js"
import { calculateEMA } from "../trend/ema.js"
import { INDICATOR_PARAMS } from "../../utils/constants.js"

export interface MACDResult {
    macd: number[]
    signal: number[]
    histogram: number[]
}

export function calculateMACD(
    data: OHLCV[],
    fastPeriod: number = INDICATOR_PARAMS.MACD.fastPeriod,
    slowPeriod: number = INDICATOR_PARAMS.MACD.slowPeriod,
    signalPeriod: number = INDICATOR_PARAMS.MACD.signalPeriod
): MACDResult {
    const emaFast = calculateEMA(data, fastPeriod)
    const emaSlow = calculateEMA(data, slowPeriod)

    // Calculate MACD line
    const macd: number[] = []
    for (let i = 0; i < data.length; i++) {
        macd.push(emaFast[i] - emaSlow[i])
    }

    // Calculate Signal line (EMA of MACD)
    const macdData: OHLCV[] = macd.map((value, idx) => ({
        timestamp: data[idx].timestamp,
        open: value,
        high: value,
        low: value,
        close: value,
        volume: 0,
    }))

    const signal = calculateEMA(macdData, signalPeriod)

    // Calculate Histogram
    const histogram: number[] = []
    for (let i = 0; i < macd.length; i++) {
        histogram.push(macd[i] - signal[i])
    }

    return { macd, signal, histogram }
}

/**
 * Detect MACD bullish crossover
 */
export function macdBullishCross(macd: number[], signal: number[]): boolean {
    if (macd.length < 2 || signal.length < 2) return false

    const prevMACD = macd[macd.length - 2]
    const prevSignal = signal[signal.length - 2]
    const currMACD = macd[macd.length - 1]
    const currSignal = signal[signal.length - 1]

    return prevMACD <= prevSignal && currMACD > currSignal
}

/**
 * Detect MACD bearish crossover
 */
export function macdBearishCross(macd: number[], signal: number[]): boolean {
    if (macd.length < 2 || signal.length < 2) return false

    const prevMACD = macd[macd.length - 2]
    const prevSignal = signal[signal.length - 2]
    const currMACD = macd[macd.length - 1]
    const currSignal = signal[signal.length - 1]

    return prevMACD >= prevSignal && currMACD < currSignal
}

/**
 * Detect histogram change from negative to positive
 */
export function histogramPositiveChange(histogram: number[]): boolean {
    if (histogram.length < 2) return false
    return (
        histogram[histogram.length - 2] <= 0 &&
        histogram[histogram.length - 1] > 0
    )
}

/**
 * Detect histogram change from positive to negative
 */
export function histogramNegativeChange(histogram: number[]): boolean {
    if (histogram.length < 2) return false
    return (
        histogram[histogram.length - 2] >= 0 &&
        histogram[histogram.length - 1] < 0
    )
}
