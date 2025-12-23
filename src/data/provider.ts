/**
 * Data provider interface
 */

import type { DataProvider, OHLCV, Timeframe } from "../types/index.js"

export { DataProvider }

/**
 * Base implementation with common utilities
 */
export abstract class BaseDataProvider implements DataProvider {
    abstract name: string

    abstract fetchOHLCV(
        symbol: string,
        timeframe: Timeframe,
        limit: number,
        targetDate?: Date
    ): Promise<OHLCV[]>

    abstract isAvailable(): Promise<boolean>

    /**
     * Validate OHLCV data integrity
     */
    protected validateData(data: OHLCV[]): boolean {
        if (!data || data.length === 0) return false

        return data.every(
            (candle) =>
                candle.timestamp > 0 &&
                candle.open > 0 &&
                candle.high >= candle.open &&
                candle.high >= candle.close &&
                candle.low <= candle.open &&
                candle.low <= candle.close &&
                candle.volume >= 0
        )
    }

    /**
     * Sort data by timestamp (ascending)
     */
    protected sortData(data: OHLCV[]): OHLCV[] {
        return data.sort((a, b) => a.timestamp - b.timestamp)
    }
}
