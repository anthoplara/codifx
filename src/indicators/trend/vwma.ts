/**
 * Volume Weighted Moving Average (VWMA)
 */

import type { OHLCV } from "../../types/index.js"

export function calculateVWMA(data: OHLCV[], period: number): number[] {
    const vwma: number[] = []

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            vwma.push(NaN)
        } else {
            const slice = data.slice(i - period + 1, i + 1)
            let volumeWeightedSum = 0
            let volumeSum = 0

            for (const candle of slice) {
                volumeWeightedSum += candle.close * candle.volume
                volumeSum += candle.volume
            }

            vwma.push(volumeSum > 0 ? volumeWeightedSum / volumeSum : NaN)
        }
    }

    return vwma
}
