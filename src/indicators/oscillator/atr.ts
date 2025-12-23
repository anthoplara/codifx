/**
 * ATR (Average True Range)
 */

import type { OHLCV } from "../../types/index.js"
import { trueRange } from "../../utils/indicators.js"

export function calculateATR(data: OHLCV[], period: number = 14): number[] {
    const tr = trueRange(data)
    const atr: number[] = []

    for (let i = 0; i < tr.length; i++) {
        if (i < period - 1) {
            atr.push(NaN)
        } else if (i === period - 1) {
            // Initial ATR is simple average
            const slice = tr.slice(0, period)
            atr.push(slice.reduce((a, b) => a + b, 0) / period)
        } else {
            // Smoothed ATR
            atr.push((atr[i - 1] * (period - 1) + tr[i]) / period)
        }
    }

    return atr
}

/**
 * Get latest ATR value
 */
export function getLatestATR(data: OHLCV[], period?: number): number {
    const atr = calculateATR(data, period)
    return atr[atr.length - 1]
}
