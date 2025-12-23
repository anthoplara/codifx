/**
 * Main package export
 */

// Core engines
export { ScannerEngine } from "./core/engine.js"
export { TrendEngine } from "./core/trend-engine.js"
export { OscillatorEngine } from "./core/oscillator-engine.js"
export { ScoringEngine, RatingEngine } from "./core/scoring.js"
export { Filters } from "./core/filters.js"
export { TimeframeManager } from "./core/timeframe.js"

// Data providers
export { YahooFinanceProvider } from "./data/yahoo.js"
export { generateMockData, generatePatternedData } from "./data/mock.js"

// Configuration
export { loadProfile, validateProfile } from "./config/loader.js"

// Utilities
export { ExplainEngine } from "./utils/explain.js"
export { Formatter } from "./utils/formatter.js"

// Types
export type {
    TradingType,
    Timeframe,
    Rating,
    SignalDirection,
    OHLCV,
    TradingSignal,
    Profile,
    DataProvider,
    TrendResult,
    OscillatorLayerResult,
    SignalScore,
} from "./types/index.js"
