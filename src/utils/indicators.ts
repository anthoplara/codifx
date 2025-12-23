/**
 * Utility functions for indicator calculations
 */

import type { OHLCV } from "../types/index.js"

/**
 * Extract close prices from OHLCV data
 */
export function getClosePrices(data: OHLCV[]): number[] {
    return data.map((d) => d.close)
}

/**
 * Extract high prices from OHLCV data
 */
export function getHighPrices(data: OHLCV[]): number[] {
    return data.map((d) => d.high)
}

/**
 * Extract low prices from OHLCV data
 */
export function getLowPrices(data: OHLCV[]): number[] {
    return data.map((d) => d.low)
}

/**
 * Extract volumes from OHLCV data
 */
export function getVolumes(data: OHLCV[]): number[] {
    return data.map((d) => d.volume)
}

/**
 * Calculate average of an array
 */
export function average(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(values: number[]): number {
    const avg = average(values)
    const squaredDiffs = values.map((val) => Math.pow(val - avg, 2))
    return Math.sqrt(average(squaredDiffs))
}

/**
 * True Range calculation for ATR
 */
export function trueRange(data: OHLCV[]): number[] {
    const tr: number[] = []

    for (let i = 0; i < data.length; i++) {
        if (i === 0) {
            tr.push(data[i].high - data[i].low)
        } else {
            const highLow = data[i].high - data[i].low
            const highClose = Math.abs(data[i].high - data[i - 1].close)
            const lowClose = Math.abs(data[i].low - data[i - 1].close)
            tr.push(Math.max(highLow, highClose, lowClose))
        }
    }

    return tr
}

/**
 * Detect crossover (fast crosses above slow)
 */
export function crossover(fast: number[], slow: number[]): boolean {
    if (fast.length < 2 || slow.length < 2) return false

    const prevFast = fast[fast.length - 2]
    const prevSlow = slow[slow.length - 2]
    const currFast = fast[fast.length - 1]
    const currSlow = slow[slow.length - 1]

    return prevFast <= prevSlow && currFast > currSlow
}

/**
 * Detect crossunder (fast crosses below slow)
 */
export function crossunder(fast: number[], slow: number[]): boolean {
    if (fast.length < 2 || slow.length < 2) return false

    const prevFast = fast[fast.length - 2]
    const prevSlow = slow[slow.length - 2]
    const currFast = fast[fast.length - 1]
    const currSlow = slow[slow.length - 1]

    return prevFast >= prevSlow && currFast < currSlow
}

/**
 * Calculate slope of values (recent trend)
 */
export function slope(values: number[], period: number = 5): number {
    if (values.length < period) return 0

    const recent = values.slice(-period)
    const n = recent.length

    let sumX = 0
    let sumY = 0
    let sumXY = 0
    let sumX2 = 0

    for (let i = 0; i < n; i++) {
        sumX += i
        sumY += recent[i]
        sumXY += i * recent[i]
        sumX2 += i * i
    }

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
}
