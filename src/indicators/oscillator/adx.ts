/**
 * ADX (Average Directional Index)
 */

import type { OHLCV } from "../../types/index.js"
import { trueRange } from "../../utils/indicators.js"
import { INDICATOR_PARAMS } from "../../utils/constants.js"

export interface ADXResult {
    adx: number[]
    plusDI: number[]
    minusDI: number[]
}

export function calculateADX(
    data: OHLCV[],
    period: number = INDICATOR_PARAMS.ADX.period
): ADXResult {
    const tr = trueRange(data)
    const plusDM: number[] = []
    const minusDM: number[] = []

    // Calculate +DM and -DM
    for (let i = 0; i < data.length; i++) {
        if (i === 0) {
            plusDM.push(0)
            minusDM.push(0)
        } else {
            const highDiff = data[i].high - data[i - 1].high
            const lowDiff = data[i - 1].low - data[i].low

            if (highDiff > lowDiff && highDiff > 0) {
                plusDM.push(highDiff)
                minusDM.push(0)
            } else if (lowDiff > highDiff && lowDiff > 0) {
                plusDM.push(0)
                minusDM.push(lowDiff)
            } else {
                plusDM.push(0)
                minusDM.push(0)
            }
        }
    }

    // Smooth TR, +DM, -DM
    const smoothedTR: number[] = []
    const smoothedPlusDM: number[] = []
    const smoothedMinusDM: number[] = []

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            smoothedTR.push(NaN)
            smoothedPlusDM.push(NaN)
            smoothedMinusDM.push(NaN)
        } else if (i === period - 1) {
            smoothedTR.push(tr.slice(0, period).reduce((a, b) => a + b, 0))
            smoothedPlusDM.push(
                plusDM.slice(0, period).reduce((a, b) => a + b, 0)
            )
            smoothedMinusDM.push(
                minusDM.slice(0, period).reduce((a, b) => a + b, 0)
            )
        } else {
            smoothedTR.push(
                smoothedTR[i - 1] - smoothedTR[i - 1] / period + tr[i]
            )
            smoothedPlusDM.push(
                smoothedPlusDM[i - 1] -
                    smoothedPlusDM[i - 1] / period +
                    plusDM[i]
            )
            smoothedMinusDM.push(
                smoothedMinusDM[i - 1] -
                    smoothedMinusDM[i - 1] / period +
                    minusDM[i]
            )
        }
    }

    // Calculate +DI and -DI
    const plusDI: number[] = []
    const minusDI: number[] = []

    for (let i = 0; i < data.length; i++) {
        if (isNaN(smoothedTR[i]) || smoothedTR[i] === 0) {
            plusDI.push(NaN)
            minusDI.push(NaN)
        } else {
            plusDI.push((smoothedPlusDM[i] / smoothedTR[i]) * 100)
            minusDI.push((smoothedMinusDM[i] / smoothedTR[i]) * 100)
        }
    }

    // Calculate DX
    const dx: number[] = []
    for (let i = 0; i < data.length; i++) {
        if (isNaN(plusDI[i]) || isNaN(minusDI[i])) {
            dx.push(NaN)
        } else {
            const sum = plusDI[i] + minusDI[i]
            if (sum === 0) {
                dx.push(0)
            } else {
                dx.push((Math.abs(plusDI[i] - minusDI[i]) / sum) * 100)
            }
        }
    }

    // Calculate ADX (smoothed DX)
    const adx: number[] = []
    for (let i = 0; i < data.length; i++) {
        if (i < period * 2 - 2) {
            adx.push(NaN)
        } else if (i === period * 2 - 2) {
            const validDX = dx
                .slice(period - 1, period * 2 - 1)
                .filter((v) => !isNaN(v))
            adx.push(validDX.reduce((a, b) => a + b, 0) / period)
        } else {
            adx.push((adx[i - 1] * (period - 1) + dx[i]) / period)
        }
    }

    return { adx, plusDI, minusDI }
}

/**
 * Get latest ADX value
 */
export function getLatestADX(data: OHLCV[], period?: number): number {
    const result = calculateADX(data, period)
    return result.adx[result.adx.length - 1]
}

/**
 * Check if ADX indicates strong trend
 */
export function isStrongTrend(adx: number): boolean {
    return adx >= INDICATOR_PARAMS.ADX.threshold
}
