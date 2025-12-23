/**
 * Signal explanation generator
 */

import type { TradingSignal } from "../types/index.js"

export class ExplainEngine {
    /**
     * Generate human-readable explanation for a signal
     */
    static generateExplanation(signal: TradingSignal): string {
        const lines: string[] = []

        lines.push(`Symbol: ${signal.symbol}`)
        lines.push(`Trading Type: ${signal.tradingType.toUpperCase()}`)
        lines.push(`Direction: ${signal.direction}`)
        lines.push(`Timestamp: ${new Date(signal.timestamp).toLocaleString()}`)
        lines.push("")

        // Trend analysis
        lines.push("**Trend Analysis** (Confirmation Timeframe):")
        if (signal.details.trend.details.length > 0) {
            signal.details.trend.details.forEach((detail) => {
                lines.push(`  - ${detail}`)
            })
        } else {
            lines.push("  - No clear trend")
        }
        lines.push("")

        // Oscillator analysis
        lines.push("**Oscillator Analysis** (Primary Timeframe):")
        if (signal.details.oscillators.details.length > 0) {
            signal.details.oscillators.details.forEach((detail) => {
                lines.push(`  - ${detail}`)
            })
        } else {
            lines.push("  - No signals detected")
        }
        lines.push("")

        // Filters
        lines.push("**Filters**:")
        lines.push(
            `  - Liquidity: ${
                signal.details.filters.liquidity ? "✓ PASS" : "✗ FAIL"
            }`
        )
        lines.push(
            `  - Volatility: ${
                signal.details.filters.volatilityPass ? "✓ PASS" : "✗ FAIL"
            }`
        )
        lines.push("")

        // Scoring breakdown
        lines.push("**Score Breakdown**:")
        lines.push(`  - Trend Score: ${signal.trendScore}/100`)
        lines.push(`  - Oscillator Score: ${signal.oscillatorScore}/100`)
        lines.push(`  - Volume Bonus: +${signal.volumeBonus}`)
        lines.push(`  - Volatility Bonus: +${signal.volatilityBonus}`)
        lines.push(`  - Confirmation Bonus: +${signal.confirmationBonus}`)
        lines.push(`  - **Final Score: ${signal.score}/100**`)
        lines.push("")

        // Rating
        lines.push(`**Rating: ${signal.rating}**`)
        lines.push("")

        // Explanation
        lines.push("**Reason**:")
        lines.push(signal.explanation)

        return lines.join("\n")
    }

    /**
     * Generate a one-line summary of the signal
     */
    static generateOneLine(signal: TradingSignal): string {
        return `${signal.symbol}: ${signal.rating} (Score: ${signal.score}) - ${signal.direction}`
    }

    /**
     * Generate explanation for why a signal was rejected
     */
    static generateRejectionReason(
        symbol: string,
        score: number,
        minScore: number,
        filterFailures: string[]
    ): string {
        const lines: string[] = []
        lines.push(`${symbol}: Signal REJECTED`)

        if (score < minScore) {
            lines.push(`  - Score (${score}) below minimum (${minScore})`)
        }

        if (filterFailures.length > 0) {
            lines.push("  - Filter failures:")
            filterFailures.forEach((failure) => {
                lines.push(`    • ${failure}`)
            })
        }

        return lines.join("\n")
    }
}
