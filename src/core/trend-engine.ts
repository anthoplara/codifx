/**
 * Trend Engine - Analyzes trend on confirmation timeframe
 */

import type {
    OHLCV,
    TrendResult,
    SignalDirection,
    TradingType,
} from "../types/index.js"
import { calculateSMA } from "../indicators/trend/sma.js"
import { calculateEMA } from "../indicators/trend/ema.js"
import { calculateHMA } from "../indicators/trend/hma.js"
import { calculateVWMA } from "../indicators/trend/vwma.js"
import { slope } from "../utils/indicators.js"
import { MA_ALIGNMENT_REQUIREMENTS } from "../utils/trading-type-config.js"

export class TrendEngine {
    /**
     * Analyze trend on confirmation timeframe
     */
    static analyze(
        data: OHLCV[],
        indicators: string[],
        tradingType: TradingType
    ): TrendResult {
        const details: string[] = []
        let bullishCount = 0
        let bearishCount = 0
        let totalIndicators = 0

        const currentPrice = data[data.length - 1].close

        // Calculate all requested moving averages
        const maValues: Record<string, number[]> = {}

        for (const indicator of indicators) {
            if (indicator.startsWith("SMA")) {
                const period = parseInt(indicator.replace("SMA", ""))
                maValues[indicator] = calculateSMA(data, period)
            } else if (indicator.startsWith("EMA")) {
                const period = parseInt(indicator.replace("EMA", ""))
                maValues[indicator] = calculateEMA(data, period)
            } else if (indicator === "HMA9") {
                maValues["HMA"] = calculateHMA(data, 9)
            } else if (indicator === "VWMA20") {
                maValues["VWMA"] = calculateVWMA(data, 20)
            }
        }

        // Analyze each MA
        for (const [name, values] of Object.entries(maValues)) {
            const latestMA = values[values.length - 1]
            if (isNaN(latestMA)) continue

            totalIndicators++

            // Price vs MA
            if (currentPrice > latestMA) {
                bullishCount++
                details.push(`Price > ${name} (${latestMA.toFixed(2)})`)
            } else if (currentPrice < latestMA) {
                bearishCount++
                details.push(`Price < ${name} (${latestMA.toFixed(2)})`)
            }

            // MA slope
            const maSlope = slope(values, 5)
            if (maSlope > 0) {
                bullishCount += 0.5
                details.push(`${name} slope ↑`)
            } else if (maSlope < 0) {
                bearishCount += 0.5
                details.push(`${name} slope ↓`)
            }
        }

        // Check EMA alignment based on trading type requirements
        const ema10 = maValues["EMA10"]
        const ema20 = maValues["EMA20"]
        const ema50 = maValues["EMA50"]

        let maAlignment = false
        const alignmentReq = MA_ALIGNMENT_REQUIREMENTS[tradingType]

        if (alignmentReq === "partial") {
            // Scalp: Just need price above any MA
            maAlignment = currentPrice > 0 // Always true if we have price
        } else if (alignmentReq === "moderate") {
            // Day: EMA10 > EMA20 required
            if (ema10 && ema20) {
                const latest10 = ema10[ema10.length - 1]
                const latest20 = ema20[ema20.length - 1]
                if (!isNaN(latest10) && !isNaN(latest20)) {
                    if (latest10 > latest20) {
                        bullishCount += 1.5
                        details.push("EMA10 > EMA20")
                        maAlignment = true
                    } else if (latest10 < latest20) {
                        bearishCount += 1.5
                        details.push("EMA10 < EMA20")
                        maAlignment = true
                    }
                }
            }
        } else if (alignmentReq === "strict") {
            // Swing: EMA10 > EMA20 > EMA50 (full alignment required)
            if (ema10 && ema20 && ema50) {
                const latest10 = ema10[ema10.length - 1]
                const latest20 = ema20[ema20.length - 1]
                const latest50 = ema50[ema50.length - 1]

                if (!isNaN(latest10) && !isNaN(latest20) && !isNaN(latest50)) {
                    if (latest10 > latest20 && latest20 > latest50) {
                        bullishCount += 2 // Bonus for perfect alignment
                        details.push(
                            "EMA10 > EMA20 > EMA50 (strong bullish alignment)"
                        )
                        maAlignment = true
                    } else if (latest10 < latest20 && latest20 < latest50) {
                        bearishCount += 2
                        details.push(
                            "EMA10 < EMA20 < EMA50 (strong bearish alignment)"
                        )
                        maAlignment = true
                    }
                }
            }
        }

        // Determine direction
        let direction: SignalDirection = "NEUTRAL"
        if (bullishCount > bearishCount) {
            direction = "BUY"
        } else if (bearishCount > bullishCount) {
            direction = "SELL"
        }

        // Calculate score (0-100)
        const maxPoints = totalIndicators * 1.5 + 2 // Each MA worth 1.5 points (price + slope), plus 2 for alignment
        const actualPoints = Math.max(bullishCount, bearishCount)
        const score = Math.min(100, (actualPoints / maxPoints) * 100)

        // Calculate overall slope
        const closes = data.map((d) => d.close)
        const overallSlope = slope(closes, 10)

        return {
            direction,
            score: Math.round(score),
            details,
            maAlignment,
            maSlope: overallSlope,
        }
    }
}
