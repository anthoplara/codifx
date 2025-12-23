/**
 * Symbol utilities for market-specific formatting
 */

export type Market = "IDX" | "NASDAQ" | "NYSE" | "CRYPTO"

/**
 * Market suffix mapping
 */
const MARKET_SUFFIX: Record<Market, string> = {
    IDX: ".JK", // Indonesia Stock Exchange
    NASDAQ: "", // No suffix needed
    NYSE: "", // No suffix needed
    CRYPTO: "-USD", // Crypto pairs
}

/**
 * Normalize symbol with market suffix if needed
 */
export function normalizeSymbol(
    symbol: string,
    market: Market = "NASDAQ"
): string {
    const suffix = MARKET_SUFFIX[market]

    // If no suffix needed, return as-is
    if (!suffix) return symbol.toUpperCase()

    // If symbol already has the suffix, return as-is
    if (symbol.toUpperCase().endsWith(suffix)) {
        return symbol.toUpperCase()
    }

    // Append suffix
    return symbol.toUpperCase() + suffix
}

/**
 * Normalize multiple symbols
 */
export function normalizeSymbols(
    symbols: string[],
    market: Market = "NASDAQ"
): string[] {
    return symbols.map((s) => normalizeSymbol(s, market))
}

/**
 * Detect market from symbol format
 */
export function detectMarket(symbol: string): Market {
    if (symbol.endsWith(".JK")) return "IDX"
    if (symbol.endsWith("-USD")) return "CRYPTO"
    return "NASDAQ" // Default
}
