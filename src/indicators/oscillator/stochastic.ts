/**
 * Stochastic Oscillator
 */

import type { OHLCV } from "../../types/index.js"
import {
    getClosePrices,
    getHighPrices,
    getLowPrices,
} from "../../utils/indicators.js"
import { calculateSMA } from "../trend/sma.js"
import { INDICATOR_PARAMS } from "../../utils/constants.js"

export interface StochasticResult {
    k: number[]
    d: number[]
}

export function calculateStochastic(
    data: OHLCV[],
    kPeriod: number = INDICATOR_PARAMS.STOCHASTIC.kPeriod,
    dPeriod: number = INDICATOR_PARAMS.STOCHASTIC.dPeriod,
    smooth: number = INDICATOR_PARAMS.STOCHASTIC.smooth
): StochasticResult {
    const closes = getClosePrices(data)
    const highs = getHighPrices(data)
    const lows = getLowPrices(data)

    const k: number[] = []

    // Calculate %K
    for (let i = 0; i < closes.length; i++) {
        if (i < kPeriod - 1) {
            k.push(NaN)
        } else {
            const highSlice = highs.slice(i - kPeriod + 1, i + 1)
            const lowSlice = lows.slice(i - kPeriod + 1, i + 1)

            const highestHigh = Math.max(...highSlice)
            const lowestLow = Math.min(...lowSlice)

            const range = highestHigh - lowestLow
            const kValue =
                range === 0 ? 50 : ((closes[i] - lowestLow) / range) * 100
            k.push(kValue)
        }
    }

    // Smooth %K if needed
    let smoothedK = k
    if (smooth > 1) {
        // Create temporary OHLCV-like data for SMA calculation
        const kData: OHLCV[] = k.map((value, idx) => ({
            timestamp: data[idx].timestamp,
            open: value,
            high: value,
            low: value,
            close: value,
            volume: 0,
        }))
        smoothedK = calculateSMA(kData, smooth)
    }

    // Calculate %D (SMA of %K)
    const kDataForD: OHLCV[] = smoothedK.map((value, idx) => ({
        timestamp: data[idx].timestamp,
        open: value,
        high: value,
        low: value,
        close: value,
        volume: 0,
    }))

    const d = calculateSMA(kDataForD, dPeriod)

    return { k: smoothedK, d }
}

/**
 * Check if Stochastic is in oversold zone
 */
export function isStochasticOversold(k: number): boolean {
    return k < INDICATOR_PARAMS.STOCHASTIC.oversold
}

/**
 * Check if Stochastic is in overbought zone
 */
export function isStochasticOverbought(k: number): boolean {
    return k > INDICATOR_PARAMS.STOCHASTIC.overbought
}

/**
 * Detect bullish crossover (%K crosses above %D)
 */
export function stochasticBullishCross(k: number[], d: number[]): boolean {
    if (k.length < 2 || d.length < 2) return false

    const prevK = k[k.length - 2]
    const prevD = d[d.length - 2]
    const currK = k[k.length - 1]
    const currD = d[d.length - 1]

    return prevK <= prevD && currK > currD
}

/**
 * Detect bearish crossover (%K crosses below %D)
 */
export function stochasticBearishCross(k: number[], d: number[]): boolean {
    if (k.length < 2 || d.length < 2) return false

    const prevK = k[k.length - 2]
    const prevD = d[d.length - 2]
    const currK = k[k.length - 1]
    const currD = d[d.length - 1]

    return prevK >= prevD && currK < currD
}
