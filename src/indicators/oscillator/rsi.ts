/**
 * Relative Strength Index (RSI)
 */

import type { OHLCV } from "../../types/index.js"
import { getClosePrices } from "../../utils/indicators.js"
import { INDICATOR_PARAMS } from "../../utils/constants.js"

export function calculateRSI(
    data: OHLCV[],
    period: number = INDICATOR_PARAMS.RSI.period
): number[] {
    const closes = getClosePrices(data)
    const rsi: number[] = []

    if (closes.length < period + 1) {
        return new Array(closes.length).fill(NaN)
    }

    let gains: number[] = []
    let losses: number[] = []

    // Calculate initial gains and losses
    for (let i = 1; i < closes.length; i++) {
        const change = closes[i] - closes[i - 1]
        gains.push(change > 0 ? change : 0)
        losses.push(change < 0 ? Math.abs(change) : 0)
    }

    // Calculate RSI
    for (let i = 0; i < gains.length; i++) {
        if (i < period - 1) {
            rsi.push(NaN)
        } else if (i === period - 1) {
            // Initial average
            const avgGain =
                gains.slice(0, period).reduce((a, b) => a + b, 0) / period
            const avgLoss =
                losses.slice(0, period).reduce((a, b) => a + b, 0) / period
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
            rsi.push(100 - 100 / (1 + rs))
        } else {
            // Smoothed average
            const prevRSI = rsi[i - 1]
            if (isNaN(prevRSI)) continue

            const prevRS = 100 - prevRSI === 0 ? 0 : prevRSI / (100 - prevRSI)
            const prevAvgGain =
                (prevRS *
                    gains.slice(i - period, i - 1).reduce((a, b) => a + b, 0)) /
                (period - 1)
            const prevAvgLoss =
                gains.slice(i - period, i - 1).reduce((a, b) => a + b, 0) /
                (period - 1)

            const avgGain = (prevAvgGain * (period - 1) + gains[i]) / period
            const avgLoss = (prevAvgLoss * (period - 1) + losses[i]) / period

            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
            rsi.push(100 - 100 / (1 + rs))
        }
    }

    // Add NaN at the beginning to match data length
    return [NaN, ...rsi]
}

/**
 * Get latest RSI value
 */
export function getLatestRSI(data: OHLCV[], period?: number): number {
    const rsi = calculateRSI(data, period)
    return rsi[rsi.length - 1]
}

/**
 * Check if RSI is in oversold zone
 */
export function isRSIOversold(value: number): boolean {
    return value < INDICATOR_PARAMS.RSI.oversold
}

/**
 * Check if RSI is in overbought zone
 */
export function isRSIOverbought(value: number): boolean {
    return value > INDICATOR_PARAMS.RSI.overbought
}

/**
 * Detect RSI crossover above oversold level
 */
export function rsiCrossoverOversold(rsi: number[]): boolean {
    if (rsi.length < 2) return false
    const prev = rsi[rsi.length - 2]
    const curr = rsi[rsi.length - 1]
    return (
        prev < INDICATOR_PARAMS.RSI.oversold &&
        curr >= INDICATOR_PARAMS.RSI.oversold
    )
}

/**
 * Detect RSI crossunder below overbought level
 */
export function rsiCrossunderOverbought(rsi: number[]): boolean {
    if (rsi.length < 2) return false
    const prev = rsi[rsi.length - 2]
    const curr = rsi[rsi.length - 1]
    return (
        prev > INDICATOR_PARAMS.RSI.overbought &&
        curr <= INDICATOR_PARAMS.RSI.overbought
    )
}
