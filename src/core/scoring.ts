/**
 * Scoring and rating system with trading-type-specific bonuses
 */

import type { SignalScore, Rating, TradingType } from "../types/index.js"
import { RATING_THRESHOLDS } from "../utils/constants.js"
import {
    VOLUME_BONUS_CONFIG,
    VOLATILITY_BONUS_CONFIG,
    CONFIRMATION_BONUS,
} from "../utils/trading-type-config.js"

export class ScoringEngine {
    /**
     * Calculate final score with weighted components
     */
    static calculateScore(
        trendScore: number,
        oscillatorScore: number,
        trendWeight: number,
        oscillatorWeight: number,
        volumeBonus: number = 0,
        volatilityBonus: number = 0,
        confirmationBonus: number = 0
    ): SignalScore {
        // Weighted base score using profile weights
        const weightedTrend = (trendScore * trendWeight) / 100
        const weightedOscillator = (oscillatorScore * oscillatorWeight) / 100
        const baseScore = weightedTrend + weightedOscillator

        // Add bonuses (capped at max score of 100)
        const finalScore = Math.min(
            100,
            baseScore + volumeBonus + volatilityBonus + confirmationBonus
        )

        return {
            trendScore,
            oscillatorScore,
            volumeBonus,
            volatilityBonus,
            confirmationBonus,
            finalScore: Math.round(finalScore),
        }
    }

    /**
     * Calculate volume bonus based on trading type
     */
    static calculateVolumeBonus(
        currentVolume: number,
        avgVolume: number,
        tradingType: TradingType
    ): number {
        if (avgVolume === 0) return 0

        const ratio = currentVolume / avgVolume
        const config = VOLUME_BONUS_CONFIG[tradingType]

        // Find the highest matching threshold
        for (let i = config.length - 1; i >= 0; i--) {
            if (ratio >= config[i].threshold) {
                return config[i].bonus
            }
        }

        return 0
    }

    /**
     * Calculate volatility bonus based on trading type
     */
    static calculateVolatilityBonus(
        atr: number,
        avgPrice: number,
        tradingType: TradingType
    ): number {
        if (avgPrice === 0) return 0

        const atrPercent = (atr / avgPrice) * 100
        const config = VOLATILITY_BONUS_CONFIG[tradingType]

        // Check if within ideal range
        if (atrPercent >= config.min && atrPercent <= config.max) {
            // Linear scaling within the range
            const rangeSize = config.max - config.min
            const position = (atrPercent - config.min) / rangeSize
            // Peak bonus at middle of range
            const distanceFromMiddle = Math.abs(0.5 - position)
            const multiplier = 1 - distanceFromMiddle
            return Math.round(config.maxBonus * multiplier)
        }

        return 0
    }

    /**
     * Calculate confirmation bonus for multi-timeframe alignment
     */
    static calculateConfirmationBonus(
        primaryDirectionBullish: boolean,
        confirmationDirectionBullish: boolean,
        tradingType: TradingType
    ): number {
        if (primaryDirectionBullish === confirmationDirectionBullish) {
            return CONFIRMATION_BONUS[tradingType]
        }
        return 0
    }
}

export class RatingEngine {
    /**
     * Assign rating based on score
export class RatingEngine {
    /**
     * Assign rating based on score
     */
    static assignRating(score: number): Rating {
        if (score >= RATING_THRESHOLDS.STRONG_BUY) return "STRONG BUY"
        if (score >= RATING_THRESHOLDS.BUY) return "BUY"
        if (score >= RATING_THRESHOLDS.SPECULATIVE) return "SPECULATIVE"
        return "NO TRADE"
    }

    /**
     * Check if score meets minimum threshold
     */
    static meetsMinimumScore(score: number, minScore: number): boolean {
        return score >= minScore
    }

    /**
     * Get minimum threshold (passthrough for consistency)
     */
    static getMinimumThreshold(minScore: number): number {
        return minScore
    }
}
