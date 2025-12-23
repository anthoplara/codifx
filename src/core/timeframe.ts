/**
 * Timeframe utilities
 */

import type { TradingType, Timeframe, TimeframeConfig } from "../types/index.js"
import { TIMEFRAME_CONFIG } from "../utils/constants.js"

export class TimeframeManager {
    /**
     * Get timeframe configuration for trading type
     */
    static getConfig(tradingType: TradingType): TimeframeConfig {
        return TIMEFRAME_CONFIG[tradingType]
    }

    /**
     * Get primary timeframe
     */
    static getPrimaryTimeframe(tradingType: TradingType): Timeframe {
        return TIMEFRAME_CONFIG[tradingType].primary
    }

    /**
     * Get confirmation timeframe
     */
    static getConfirmationTimeframe(tradingType: TradingType): Timeframe {
        return TIMEFRAME_CONFIG[tradingType].confirmation
    }

    /**
     * Convert timeframe to minutes
     */
    static toMinutes(timeframe: Timeframe): number {
        const mapping: Record<Timeframe, number> = {
            "1m": 1,
            "5m": 5,
            "15m": 15,
            "1h": 60,
            "1d": 1440,
        }
        return mapping[timeframe]
    }

    /**
     * Get data point count needed for timeframe
     */
    static getDataPointCount(timeframe: Timeframe): number {
        // Data point requirements per timeframe
        const counts: Record<Timeframe, number> = {
            "1m": 300, // Scalp - needs more data for noise reduction
            "5m": 200, // Day
            "15m": 200, // Day confirmation
            "1h": 150, // Swing
            "1d": 150, // Swing confirmation
        }
        return counts[timeframe] || 200
    }
}
