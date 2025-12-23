/**
 * Exponential Moving Average (EMA)
 */

import type { OHLCV } from "../../types/index.js"
import { getClosePrices } from "../../utils/indicators.js"

export function calculateEMA(data: OHLCV[], period: number): number[] {
    const closes = getClosePrices(data)
    const ema: number[] = []
    const multiplier = 2 / (period + 1)

    for (let i = 0; i < closes.length; i++) {
        if (i === 0) {
            ema.push(closes[i])
        } else if (i < period) {
            // Use SMA for initial values
            const slice = closes.slice(0, i + 1)
            const sma = slice.reduce((acc, val) => acc + val, 0) / slice.length
            ema.push(sma)
        } else {
            const value = (closes[i] - ema[i - 1]) * multiplier + ema[i - 1]
            ema.push(value)
        }
    }

    return ema
}

/**
 * Get EMA for specific periods
 */
export function getEMA(
    data: OHLCV[],
    periods: number[] = [10, 20, 50]
): Record<string, number[]> {
    const result: Record<string, number[]> = {}

    for (const period of periods) {
        result[`EMA${period}`] = calculateEMA(data, period)
    }

    return result
}
