/**
 * Core type definitions for codifx trading scanner
 */

export type TradingType = "scalp" | "day" | "swing"

export type Timeframe = "1m" | "5m" | "15m" | "1h" | "1d"

export type Rating = "STRONG BUY" | "BUY" | "SPECULATIVE" | "NO TRADE"

export type SignalDirection = "BUY" | "SELL" | "NEUTRAL"

/**
 * Market data structure (OHLCV)
 */
export interface OHLCV {
    timestamp: number
    open: number
    high: number
    low: number
    close: number
    volume: number
}

/**
 * Indicator result with metadata
 */
export interface IndicatorResult {
    name: string
    value: number
    timestamp: number
    metadata?: Record<string, any>
}

/**
 * Oscillator layer detection results
 */
export interface OscillatorLayerResult {
    condition: boolean // Layer 1: Zone detection
    trigger: boolean // Layer 2: Event detection
    confirmation: boolean // Layer 3: Validation
    score: number
    details: string[]
}

/**
 * Trend analysis result
 */
export interface TrendResult {
    direction: SignalDirection
    score: number
    details: string[]
    maAlignment: boolean
    maSlope: number
}

/**
 * Signal scoring components
 */
export interface SignalScore {
    trendScore: number // 0-100
    oscillatorScore: number // 0-100
    volumeBonus: number // 0-10
    volatilityBonus: number // 0-10
    confirmationBonus: number // 0-10
    finalScore: number // Weighted total
}

/**
 * Complete trading signal
 */
export interface TradingSignal {
    symbol: string
    direction: SignalDirection
    score: number
    rating: Rating
    timestamp: number
    timeframe: Timeframe
    price: number
    trendScore: number
    oscillatorScore: number
    volumeBonus: number
    volatilityBonus: number
    confirmationBonus: number
    trendDetails: string[]
    oscillatorDetails: string[]
    tradingType: TradingType
    explanation: string

    // Trading Levels
    entry: number // Entry price (current price)
    support: number // Nearest support level
    resistance: number // Nearest resistance level
    stopLoss: number // Calculated SL based on ATR
    takeProfit: number // Calculated TP based on risk-reward

    // Risk Management
    winRate: number // Estimated win rate (0-100%)
    riskRewardRatio: number // TP distance / SL distance

    details: {
        trend: TrendResult
        oscillators: OscillatorLayerResult
        filters: {
            liquidity: boolean
            volatilityPass: boolean
        }
    }
}

/**
 * Comprehensive analysis result - always includes full data
 */
export interface AnalysisResult {
    // Core analysis scores
    trendScore: number
    oscillatorScore: number
    finalScore: number
    volumeBonus: number
    volatilityBonus: number
    confirmationBonus: number

    // Filter results
    liquidityPass: boolean
    volatilityPass: boolean

    // Detailed analysis
    trendDetails: string[]
    oscillatorDetails: string[]

    // Signal if qualified, null if not
    signal: TradingSignal | null

    // Failure analysis
    failureReasons: string[]
    minScoreThreshold: number
}

/**
 * Filter configuration
 */
export interface FilterConfig {
    minVolume: number
    minADX: number
    atrMinPercent?: number
    atrMaxPercent?: number
}

/**
 * Configuration profile structure
 */
export interface Profile {
    tradingType: TradingType
    timeframes: {
        primary: Timeframe
        confirmation: Timeframe
    }
    indicators: {
        trend: string[]
        oscillators: string[]
    }
    weights: {
        trend: number
        oscillator: number
    }
    filters: FilterConfig
    scoring: {
        minScore: number
    }
    dataSource?: {
        provider: string
        apiKey?: string
        market?: "IDX" | "NASDAQ" | "NYSE" | "CRYPTO"
        defaultSymbols?: string[]
    }
}

/**
 * Timeframe configuration by trading type
 */
export interface TimeframeConfig {
    primary: Timeframe
    confirmation: Timeframe
}

/**
 * Weight configuration by trading type
 */
export interface WeightConfig {
    trend: number
    oscillator: number
}

/**
 * Data provider interface
 */
export interface DataProvider {
    name: string
    fetchOHLCV(
        symbol: string,
        timeframe: Timeframe,
        limit: number
    ): Promise<OHLCV[]>
    isAvailable(): Promise<boolean>
}

/**
 * Indicator calculation interface
 */
export interface Indicator {
    name: string
    calculate(data: OHLCV[]): number[]
    getMetadata(): Record<string, any>
}
