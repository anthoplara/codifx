/**
 * Mock data generator for simulation mode
 */

import type { OHLCV, Timeframe } from "../types/index.js"

/**
 * Generate realistic mock OHLCV data
 */
export function generateMockData(
    _symbol: string,
    timeframe: Timeframe,
    count: number = 200,
    trend: "up" | "down" | "sideways" = "up"
): OHLCV[] {
    const data: OHLCV[] = []
    let basePrice = 100
    const now = Date.now()
    const interval = getTimeframeInterval(timeframe)

    for (let i = count - 1; i >= 0; i--) {
        const timestamp = now - i * interval

        // Generate price movement based on trend
        let change = 0
        if (trend === "up") {
            change = (Math.random() - 0.3) * 2 // Bias upward
        } else if (trend === "down") {
            change = (Math.random() - 0.7) * 2 // Bias downward
        } else {
            change = (Math.random() - 0.5) * 2 // Neutral
        }

        const open = basePrice
        const close = basePrice + change
        const high = Math.max(open, close) + Math.random() * 0.5
        const low = Math.min(open, close) - Math.random() * 0.5
        const volume = Math.floor(1000000 + Math.random() * 2000000)

        data.push({
            timestamp,
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume,
        })

        basePrice = close
    }

    return data
}

/**
 * Get millisecond interval for timeframe
 */
function getTimeframeInterval(timeframe: Timeframe): number {
    const intervals: Record<Timeframe, number> = {
        "1m": 60 * 1000,
        "5m": 5 * 60 * 1000,
        "15m": 15 * 60 * 1000,
        "1h": 60 * 60 * 1000,
        "1d": 24 * 60 * 60 * 1000,
    }
    return intervals[timeframe]
}

/**
 * Generate mock data with specific patterns for testing
 */
export function generatePatternedData(
    pattern: "oversold-reversal" | "overbought-reversal" | "strong-trend",
    count: number = 200
): OHLCV[] {
    const now = Date.now()
    const interval = 5 * 60 * 1000 // 5m
    const data: OHLCV[] = []

    let basePrice = 100

    for (let i = count - 1; i >= 0; i--) {
        const timestamp = now - i * interval
        let change = 0

        if (pattern === "oversold-reversal") {
            // Create downtrend then reversal
            if (i > 30) {
                change = (Math.random() - 0.7) * 3 // Strong downtrend
            } else if (i > 20) {
                change = (Math.random() - 0.4) * 1.5 // Slowing
            } else {
                change = (Math.random() - 0.2) * 2 // Reversal up
            }
        } else if (pattern === "overbought-reversal") {
            // Create uptrend then reversal
            if (i > 30) {
                change = (Math.random() - 0.3) * 3 // Strong uptrend
            } else if (i > 20) {
                change = (Math.random() - 0.4) * 1.5 // Slowing
            } else {
                change = (Math.random() - 0.7) * 2 // Reversal down
            }
        } else if (pattern === "strong-trend") {
            // Consistent uptrend
            change = (Math.random() - 0.25) * 2.5
        }

        const open = basePrice
        const close = basePrice + change
        const high = Math.max(open, close) + Math.random() * 0.5
        const low = Math.min(open, close) - Math.random() * 0.5
        const volume = Math.floor(1500000 + Math.random() * 1500000)

        data.push({
            timestamp,
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume,
        })

        basePrice = close
    }

    return data
}
