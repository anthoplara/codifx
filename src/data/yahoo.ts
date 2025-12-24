/**
 * Yahoo Finance data provider
 */

import axios from "axios"
import type { OHLCV, Timeframe } from "../types/index.js"
import { BaseDataProvider } from "./provider.js"

export class YahooFinanceProvider extends BaseDataProvider {
    name = "yahoo"
    private baseUrl = "https://query1.finance.yahoo.com/v8/finance/chart"

    async fetchOHLCV(
        symbol: string,
        timeframe: Timeframe,
        limit: number = 200,
        targetDate?: Date
    ): Promise<OHLCV[]> {
        try {
            const interval = this.convertTimeframe(timeframe)
            const period = this.calculatePeriod(timeframe, limit, targetDate)
            const url = `${this.baseUrl}/${symbol}`
            const response = await axios.get(url, {
                params: {
                    interval,
                    range: period,
                },
                timeout: 10000,
            })

            const result = response.data.chart.result[0]
            const timestamps = result.timestamp
            const quote = result.indicators.quote[0]

            const rawData: OHLCV[] = timestamps.map(
                (timestamp: number, index: number) => ({
                    timestamp: timestamp * 1000, // Convert to milliseconds
                    open: quote.open[index],
                    high: quote.high[index],
                    low: quote.low[index],
                    close: quote.close[index],
                    volume: quote.volume[index],
                })
            )

            const validData = rawData
                .filter((item: any) => {
                    return (
                        item.timestamp !== null &&
                        item.close !== null &&
                        item.open !== null &&
                        item.high !== null &&
                        item.low !== null &&
                        item.volume !== null
                    )
                })
                .map((item: any) => ({
                    timestamp: item.timestamp,
                    open: item.open,
                    close: item.close,
                    high: item.high,
                    low: item.low,
                    volume: item.volume,
                }))
                .filter((candle: OHLCV) => this.isValidCandle(candle))

            // Ensure we have enough valid data (at least 80% of requested)
            const minRequired = Math.floor(limit * 0.8)
            if (validData.length < minRequired) {
                throw new Error(
                    `Insufficient valid data: only ${validData.length}/${limit} candles are valid. ` +
                        `Market may be closed or data quality is poor.`
                )
            }

            // Filter by targetDate if provided
            let filteredData = validData
            if (targetDate) {
                const maxTimestamp = targetDate.getTime()
                filteredData = validData.filter(
                    (candle: OHLCV) => candle.timestamp <= maxTimestamp
                )
            }

            if (!this.validateData(filteredData)) {
                throw new Error("Invalid data received from Yahoo Finance")
            }

            return this.sortData(filteredData).slice(-limit)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Yahoo Finance API error: ${error.message}`)
            }
            throw error
        }
    }

    async isAvailable(): Promise<boolean> {
        try {
            // Test with a well-known symbol
            await axios.get(`${this.baseUrl}/AAPL`, {
                params: { interval: "1d", range: "1d" },
                timeout: 5000,
            })
            return true
        } catch {
            return false
        }
    }

    /**
     * Convert our timeframe format to Yahoo Finance interval
     */
    private convertTimeframe(timeframe: Timeframe): string {
        const mapping: Record<Timeframe, string> = {
            "1m": "1m",
            "5m": "5m",
            "15m": "15m",
            "1h": "1h",
            "1d": "1d",
        }
        return mapping[timeframe]
    }

    /**
     * Validate individual candle for data quality
     */
    private isValidCandle(candle: OHLCV): boolean {
        // Check all values are valid numbers
        if (
            typeof candle.timestamp !== "number" ||
            typeof candle.open !== "number" ||
            isNaN(candle.open) ||
            typeof candle.close !== "number" ||
            isNaN(candle.close) ||
            typeof candle.high !== "number" ||
            isNaN(candle.high) ||
            typeof candle.low !== "number" ||
            isNaN(candle.low) ||
            typeof candle.volume !== "number" ||
            isNaN(candle.volume)
        ) {
            return false
        }

        // Sanity checks for OHLC relationships
        if (candle.high < candle.low) return false
        if (candle.high < candle.open) return false
        if (candle.high < candle.close) return false
        if (candle.low > candle.open) return false
        if (candle.low > candle.close) return false

        // Volume should be non-negative
        if (candle.volume < 0) return false

        // All prices should be positive
        if (
            candle.open <= 0 ||
            candle.close <= 0 ||
            candle.high <= 0 ||
            candle.low <= 0
        ) {
            return false
        }

        return true
    }

    /**
     * Calculate appropriate period range based on timeframe and limit
     * If targetDate is provided, calculate from that date instead of today
     */
    private calculatePeriod(
        timeframe: Timeframe,
        limit: number,
        targetDate?: Date
    ): string {
        // Estimate trading hours per day (Indonesian market: ~6.5 hours)
        const tradingHoursPerDay = 6.5

        // Calculate approximate days needed based on timeframe
        let daysNeeded: number

        switch (timeframe) {
            case "1m":
                // 1 minute candles: ~390 candles per day (6.5 hours * 60)
                daysNeeded = Math.ceil(limit / 390)
                break
            case "5m":
                // 5 minute candles: ~78 candles per day
                daysNeeded = Math.ceil(limit / 78)
                break
            case "15m":
                // 15 minute candles: ~26 candles per day
                daysNeeded = Math.ceil(limit / 26)
                break
            case "1h":
                // 1 hour candles: ~6.5 candles per day
                daysNeeded = Math.ceil(limit / tradingHoursPerDay)
                break
            case "1d":
                // Daily candles: 1 candle per day
                daysNeeded = limit
                break
            default:
                daysNeeded = 5
        }

        // Add 50% buffer for weekends, holidays, and data gaps
        daysNeeded = Math.ceil(daysNeeded * 1.5)

        // If targetDate provided, add days from targetDate to today
        if (targetDate) {
            const today = new Date()
            const daysSinceTarget = Math.floor(
                (today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)
            )
            daysNeeded += daysSinceTarget
        }

        // Map to Yahoo Finance period strings
        if (daysNeeded <= 1) return "1d"
        if (daysNeeded <= 5) return "5d"
        if (daysNeeded <= 30) return "1mo"
        if (daysNeeded <= 90) return "3mo"
        if (daysNeeded <= 180) return "6mo"
        if (daysNeeded <= 365) return "1y"
        if (daysNeeded <= 730) return "2y"
        return "5y" // Maximum
    }
}
