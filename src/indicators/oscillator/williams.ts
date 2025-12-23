/**
 * Williams %R
 */

import type { OHLCV } from "../../types/index.js"
import {
    getClosePrices,
    getHighPrices,
    getLowPrices,
} from "../../utils/indicators.js"
import { INDICATOR_PARAMS } from "../../utils/constants.js"

export function calculateWilliamsR(
    data: OHLCV[],
    period: number = INDICATOR_PARAMS.WILLIAMS_R.period
): number[] {
    const closes = getClosePrices(data)
    const highs = getHighPrices(data)
    const lows = getLowPrices(data)
    const williamsR: number[] = []

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            williamsR.push(NaN)
        } else {
            const highSlice = highs.slice(i - period + 1, i + 1)
            const lowSlice = lows.slice(i - period + 1, i + 1)

            const highestHigh = Math.max(...highSlice)
            const lowestLow = Math.min(...lowSlice)

            const range = highestHigh - lowestLow
            if (range === 0) {
                williamsR.push(-50)
            } else {
                const wr = ((highestHigh - closes[i]) / range) * -100
                williamsR.push(wr)
            }
        }
    }

    return williamsR
}

/**
 * Check if Williams %R is oversold
 */
export function isWilliamsROversold(wr: number): boolean {
    return wr < INDICATOR_PARAMS.WILLIAMS_R.oversold
}

/**
 * Check if Williams %R is overbought
 */
export function isWilliamsROverbought(wr: number): boolean {
    return wr > INDICATOR_PARAMS.WILLIAMS_R.overbought
}
