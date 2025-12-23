/**
 * Level Calculator - Support/Resistance and Price Levels
 */

import type { OHLCV } from "../types/index.js"

export class LevelCalculator {
    /**
     * Calculate support level using swing lows
     */
    static calculateSupport(data: OHLCV[], currentPrice: number): number {
        // Look at last 20 candles for swing lows
        const recentData = data.slice(-20)
        const lows = recentData.map((d) => d.low).sort((a, b) => a - b)

        // Find significant low below current price
        for (const low of lows) {
            if (low < currentPrice * 0.99) {
                // Support at least 1% below current
                return low
            }
        }

        // Fallback: use lowest low
        return lows[0]
    }

    /**
     * Calculate resistance level using swing highs
     */
    static calculateResistance(data: OHLCV[], currentPrice: number): number {
        // Look at last 20 candles for swing highs
        const recentData = data.slice(-20)
        const highs = recentData.map((d) => d.high).sort((a, b) => b - a)

        // Find significant high above current price
        for (const high of highs) {
            if (high > currentPrice * 1.01) {
                // Resistance at least 1% above current
                return high
            }
        }

        // Fallback: use highest high
        return highs[0]
    }

    /**
     * Calculate Stop Loss based on ATR
     */
    static calculateStopLoss(
        entry: number,
        atr: number,
        direction: string,
        multiplier: number = 2.0
    ): number {
        const slDistance = atr * multiplier

        if (direction === "BUY") {
            // SL below entry for BUY
            return entry - slDistance
        } else {
            // SL above entry for SELL
            return entry + slDistance
        }
    }

    /**
     * Calculate Take Profit based on Risk-Reward ratio
     */
    static calculateTakeProfit(
        entry: number,
        stopLoss: number,
        direction: string,
        riskRewardRatio: number = 2.0
    ): number {
        const slDistance = Math.abs(entry - stopLoss)
        const tpDistance = slDistance * riskRewardRatio

        if (direction === "BUY") {
            // TP above entry for BUY
            return entry + tpDistance
        } else {
            // TP below entry for SELL
            return entry - tpDistance
        }
    }

    /**
     * Estimate WinRate based on signal strength
     */
    static estimateWinRate(
        finalScore: number,
        confirmationBonus: number,
        volumeBonus: number
    ): number {
        // Base winrate from score (40-80% range)
        const baseWinRate = 40 + (finalScore / 100) * 40

        // Boost from confirmations
        const confirmationBoost = confirmationBonus > 0 ? 5 : 0
        const volumeBoost = volumeBonus > 0 ? 5 : 0

        // Calculate final winrate (max 95%)
        const finalWinRate = Math.min(
            95,
            baseWinRate + confirmationBoost + volumeBoost
        )

        return Math.round(finalWinRate)
    }
}
