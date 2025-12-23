/**
 * CCI (Commodity Channel Index)
 */

import type { OHLCV } from "../../types/index.js"
import { INDICATOR_PARAMS } from "../../utils/constants.js"

export function calculateCCI(
    data: OHLCV[],
    period: number = INDICATOR_PARAMS.CCI.period
): number[] {
    const cci: number[] = []
    const typicalPrices: number[] = data.map(
        (d) => (d.high + d.low + d.close) / 3
    )

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            cci.push(NaN)
        } else {
            const slice = typicalPrices.slice(i - period + 1, i + 1)
            const sma = slice.reduce((a, b) => a + b, 0) / period
            const meanDeviation =
                slice.reduce((sum, val) => sum + Math.abs(val - sma), 0) /
                period

            if (meanDeviation === 0) {
                cci.push(0)
            } else {
                cci.push((typicalPrices[i] - sma) / (0.015 * meanDeviation))
            }
        }
    }

    return cci
}

/**
 * Check if CCI is oversold
 */
export function isCCIOversold(cci: number): boolean {
    return cci < INDICATOR_PARAMS.CCI.oversold
}

/**
 * Check if CCI is overbought
 */
export function isCCIOverbought(cci: number): boolean {
    return cci > INDICATOR_PARAMS.CCI.overbought
}
