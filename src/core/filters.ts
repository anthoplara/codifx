/**
 * Filters for liquidity and volatility
 */

import type { OHLCV } from "../types/index.js"
import { average } from "../utils/indicators.js"
import { getLatestATR } from "../indicators/oscillator/atr.js"

export interface FilterResult {
    passed: boolean
    reason?: string
}

export class Filters {
    /**
     * Check if volume meets minimum threshold
     */
    static checkLiquidity(data: OHLCV[], minVolume: number): FilterResult {
        const volumes = data.map((d) => d.volume)
        const avgVolume = average(volumes)

        if (avgVolume < minVolume) {
            return {
                passed: false,
                reason: `Average volume (${avgVolume.toLocaleString()}) below minimum (${minVolume.toLocaleString()})`,
            }
        }

        return { passed: true }
    }

    /**
     * Check if volatility is within acceptable range using ATR%
     */
    static checkVolatility(
        data: OHLCV[],
        atrMinPercent?: number,
        atrMaxPercent?: number
    ): FilterResult {
        if (!atrMinPercent && !atrMaxPercent) {
            return { passed: true }
        }

        const atr = getLatestATR(data, 14)
        const currentPrice = data[data.length - 1].close
        const atrPercent = (atr / currentPrice) * 100

        if (isNaN(atrPercent)) {
            return {
                passed: false,
                reason: "Insufficient data to calculate ATR",
            }
        }

        if (atrMinPercent && atrPercent < atrMinPercent) {
            return {
                passed: false,
                reason: `ATR ${atrPercent.toFixed(
                    2
                )}% below minimum ${atrMinPercent}%`,
            }
        }

        if (atrMaxPercent && atrPercent > atrMaxPercent) {
            return {
                passed: false,
                reason: `ATR ${atrPercent.toFixed(
                    2
                )}% above maximum ${atrMaxPercent}%`,
            }
        }

        return { passed: true }
    }

    /**
     * Apply all filters
     */
    static applyAll(
        data: OHLCV[],
        minVolume: number,
        atrMinPercent?: number,
        atrMaxPercent?: number
    ): { passed: boolean; failures: string[] } {
        const failures: string[] = []

        const liquidityResult = this.checkLiquidity(data, minVolume)
        if (!liquidityResult.passed && liquidityResult.reason) {
            failures.push(liquidityResult.reason)
        }

        const volatilityResult = this.checkVolatility(
            data,
            atrMinPercent,
            atrMaxPercent
        )
        if (!volatilityResult.passed && volatilityResult.reason) {
            failures.push(volatilityResult.reason)
        }

        return {
            passed: failures.length === 0,
            failures,
        }
    }
}
