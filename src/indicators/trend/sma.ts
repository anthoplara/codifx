/**
 * Simple Moving Average (SMA)
 */

import type { OHLCV } from "../../types/index.js"
import { getClosePrices } from "../../utils/indicators.js"

export function calculateSMA(data: OHLCV[], period: number): number[] {
    const closes = getClosePrices(data)
    const sma: number[] = []

    for (let i = 0; i < closes.length; i++) {
        if (i < period - 1) {
            sma.push(NaN)
        } else {
            const slice = closes.slice(i - period + 1, i + 1)
            const sum = slice.reduce((acc, val) => acc + val, 0)
            sma.push(sum / period)
        }
    }

    return sma
}

/**
 * Get SMA for specific periods
 */
export function getSMA(
    data: OHLCV[],
    periods: number[] = [10, 20, 50]
): Record<string, number[]> {
    const result: Record<string, number[]> = {}

    for (const period of periods) {
        result[`SMA${period}`] = calculateSMA(data, period)
    }

    return result
}
