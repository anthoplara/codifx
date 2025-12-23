/**
 * Momentum Indicator
 */

import type { OHLCV } from "../../types/index.js"
import { getClosePrices } from "../../utils/indicators.js"
import { INDICATOR_PARAMS } from "../../utils/constants.js"

export function calculateMomentum(
    data: OHLCV[],
    period: number = INDICATOR_PARAMS.MOMENTUM.period
): number[] {
    const closes = getClosePrices(data)
    const momentum: number[] = []

    for (let i = 0; i < closes.length; i++) {
        if (i < period) {
            momentum.push(NaN)
        } else {
            momentum.push(closes[i] - closes[i - period])
        }
    }

    return momentum
}

/**
 * Detect momentum cross above zero
 */
export function momentumCrossAboveZero(momentum: number[]): boolean {
    if (momentum.length < 2) return false
    return (
        momentum[momentum.length - 2] <= 0 && momentum[momentum.length - 1] > 0
    )
}

/**
 * Detect momentum cross below zero
 */
export function momentumCrossBelowZero(momentum: number[]): boolean {
    if (momentum.length < 2) return false
    return (
        momentum[momentum.length - 2] >= 0 && momentum[momentum.length - 1] < 0
    )
}
