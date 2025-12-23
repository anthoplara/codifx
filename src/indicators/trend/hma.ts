/**
 * Hull Moving Average (HMA)
 * HMA = WMA(2 * WMA(n/2) - WMA(n)), period = sqrt(n)
 */

import type { OHLCV } from "../../types/index.js"
import { getClosePrices } from "../../utils/indicators.js"

function calculateWMA(values: number[], period: number): number[] {
    const wma: number[] = []

    for (let i = 0; i < values.length; i++) {
        if (i < period - 1) {
            wma.push(NaN)
        } else {
            const slice = values.slice(i - period + 1, i + 1)
            let weightedSum = 0
            let weightSum = 0

            for (let j = 0; j < slice.length; j++) {
                const weight = j + 1
                weightedSum += slice[j] * weight
                weightSum += weight
            }

            wma.push(weightedSum / weightSum)
        }
    }

    return wma
}

export function calculateHMA(data: OHLCV[], period: number): number[] {
    const closes = getClosePrices(data)
    const halfPeriod = Math.floor(period / 2)
    const sqrtPeriod = Math.floor(Math.sqrt(period))

    // Calculate WMA(n/2)
    const wmaHalf = calculateWMA(closes, halfPeriod)

    // Calculate WMA(n)
    const wmaFull = calculateWMA(closes, period)

    // Calculate 2 * WMA(n/2) - WMA(n)
    const diff: number[] = []
    for (let i = 0; i < closes.length; i++) {
        if (isNaN(wmaHalf[i]) || isNaN(wmaFull[i])) {
            diff.push(NaN)
        } else {
            diff.push(2 * wmaHalf[i] - wmaFull[i])
        }
    }

    // Calculate WMA of diff with sqrt(n) period
    const hma = calculateWMA(diff, sqrtPeriod)

    return hma
}
