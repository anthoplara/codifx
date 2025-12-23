/**
 * Trading scanner constants
 */

import type {
    TradingType,
    TimeframeConfig,
    WeightConfig,
} from "../types/index.js"

/**
 * Timeframe configuration by trading type
 */
export const TIMEFRAME_CONFIG: Record<TradingType, TimeframeConfig> = {
    scalp: {
        primary: "1m",
        confirmation: "5m",
    },
    day: {
        primary: "5m",
        confirmation: "15m",
    },
    swing: {
        primary: "1h",
        confirmation: "1d",
    },
}

/**
 * Weight configuration by trading type
 */
export const WEIGHT_CONFIG: Record<TradingType, WeightConfig> = {
    scalp: {
        trend: 30,
        oscillator: 70,
    },
    day: {
        trend: 40,
        oscillator: 60,
    },
    swing: {
        trend: 60,
        oscillator: 40,
    },
}

/**
 * Minimum score thresholds by trading type
 */
export const MIN_SCORE_THRESHOLD: Record<TradingType, number> = {
    scalp: 65,
    day: 70,
    swing: 75,
}

/**
 * Rating thresholds
 */
export const RATING_THRESHOLDS = {
    STRONG_BUY: 85,
    BUY: 75,
    SPECULATIVE: 65,
}

/**
 * Indicator parameters
 */
export const INDICATOR_PARAMS = {
    RSI: {
        period: 14,
        oversold: 30,
        overbought: 70,
    },
    STOCHASTIC: {
        kPeriod: 14,
        dPeriod: 3,
        smooth: 3,
        oversold: 20,
        overbought: 80,
    },
    MACD: {
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
    },
    MOMENTUM: {
        period: 10,
    },
    ADX: {
        period: 14,
        threshold: 20,
    },
    CCI: {
        period: 20,
        oversold: -100,
        overbought: 100,
    },
    WILLIAMS_R: {
        period: 14,
        oversold: -80,
        overbought: -20,
    },
    SMA: {
        periods: [10, 20, 50],
    },
    EMA: {
        periods: [10, 20, 50],
    },
    HMA: {
        period: 9,
    },
    VWMA: {
        period: 20,
    },
}
