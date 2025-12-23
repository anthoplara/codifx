/**
 * Trading-type-specific bonus and penalty configuration
 */

import type { TradingType } from "../types/index.js"

/**
 * Volume bonus configuration by trading type
 */
export const VOLUME_BONUS_CONFIG: Record<
    TradingType,
    { threshold: number; bonus: number }[]
> = {
    scalp: [
        { threshold: 1.5, bonus: 3 },
        { threshold: 2.0, bonus: 5 },
        { threshold: 3.0, bonus: 7 },
    ],
    day: [
        { threshold: 1.5, bonus: 5 },
        { threshold: 2.0, bonus: 8 },
        { threshold: 3.0, bonus: 10 },
    ],
    swing: [
        { threshold: 1.5, bonus: 5 },
        { threshold: 2.0, bonus: 8 },
        { threshold: 3.0, bonus: 10 },
    ],
}

/**
 * Volatility bonus configuration by trading type
 * Based on ATR percentage
 */
export const VOLATILITY_BONUS_CONFIG: Record<
    TradingType,
    { min: number; max: number; maxBonus: number }
> = {
    scalp: {
        min: 1.0, // 1% ATR
        max: 5.0, // 5% ATR
        maxBonus: 8,
    },
    day: {
        min: 0.5,
        max: 3.0,
        maxBonus: 6,
    },
    swing: {
        min: 0.5,
        max: 2.0,
        maxBonus: 5,
    },
}

/**
 * Confirmation bonus by trading type
 */
export const CONFIRMATION_BONUS: Record<TradingType, number> = {
    scalp: 5,
    day: 7,
    swing: 10,
}

/**
 * Reversal speed bonus/penalty
 * Positive = bonus, Negative = penalty
 */
export const REVERSAL_SPEED_MODIFIER: Record<TradingType, number> = {
    scalp: 5, // Fast reversal is good
    day: 2, // Neutral
    swing: -3, // Fast reversal is bad (too volatile)
}

/**
 * Trend length bonus/penalty
 * Based on how long the trend has been running
 */
export const TREND_LENGTH_MODIFIER: Record<TradingType, number> = {
    scalp: -2, // Long trend = late entry
    day: 3, // Long trend = momentum
    swing: 7, // Long trend = strong trend
}

/**
 * MA alignment requirements by trading type
 */
export const MA_ALIGNMENT_REQUIREMENTS = {
    scalp: "partial", // Just price > MA
    day: "moderate", // EMA10 > EMA20
    swing: "strict", // EMA10 > EMA20 > EMA50
} as const

/**
 * Special penalty amounts
 */
export const SPECIAL_PENALTIES = {
    swing: {
        noFullAlignment: -15,
        trendConflict: -999, // Auto reject
        flatADX: -999, // Auto reject
    },
    day: {
        highNoise: -10,
        weakConfirmation: -5,
    },
    scalp: {
        lowVolume: -10,
    },
} as const
