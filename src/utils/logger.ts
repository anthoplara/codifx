/**
 * Logging utility for scan results
 */

import { writeFile, mkdir } from "fs/promises"
import { dirname } from "path"
import type { TradingSignal } from "../types/index.js"

export class ScanLogger {
    private logs: string[] = []
    private scanStartTime: number = Date.now()
    private rejectionStats = {
        liquidity: 0,
        volatility: 0,
        lowScore: 0,
        noReversal: 0,
    }

    /**
     * Log scan start
     */
    logStart(tradingType: string, timeframes: any, symbols: string[]): void {
        const now = new Date()
        this.logs.push("=".repeat(80))
        this.logs.push(
            `CODIFX SCAN LOG - ${now.toLocaleString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
            })}`
        )
        this.logs.push("=".repeat(80))
        this.logs.push("")
        this.logs.push(`Trading Type: ${tradingType.toUpperCase()}`)
        this.logs.push(`Primary Timeframe: ${timeframes.primary}`)
        this.logs.push(`Confirmation Timeframe: ${timeframes.confirmation}`)
        this.logs.push(`Symbols to Scan: ${symbols.join(", ")}`)
        this.logs.push(`Total Symbols: ${symbols.length}`)
        this.logs.push("")
        this.logs.push("-".repeat(80))
        this.logs.push("")
    }

    /**
     * Log a trading signal
     */
    logSignal(signal: TradingSignal): void {
        this.logs.push(`[${signal.symbol}] ✔ SIGNAL FOUND`)
        this.logs.push(`  Direction: ${signal.direction}`)
        this.logs.push(`  Rating: ${signal.rating}`)
        this.logs.push(`  Final Score: ${signal.score}/100`)
        this.logs.push(`  Score Breakdown:`)
        this.logs.push(`    - Trend: ${signal.trendScore}/100`)
        this.logs.push(`    - Oscillator: ${signal.oscillatorScore}/100`)
        this.logs.push(`    - Volume Bonus: +${signal.volumeBonus}`)
        this.logs.push(`    - Volatility Bonus: +${signal.volatilityBonus}`)
        this.logs.push(`    - Confirmation Bonus: +${signal.confirmationBonus}`)

        if (signal.trendDetails && signal.trendDetails.length > 0) {
            this.logs.push(`  Trend Details:`)
            signal.trendDetails.forEach((d) => {
                this.logs.push(`    - ${d}`)
            })
        }

        if (signal.oscillatorDetails && signal.oscillatorDetails.length > 0) {
            this.logs.push(`  Oscillator Details:`)
            signal.oscillatorDetails.forEach((d) => {
                this.logs.push(`    - ${d}`)
            })
        }

        this.logs.push(`  Filters:`)
        this.logs.push(`    - Liquidity: PASS`)
        this.logs.push(`    - Volatility: PASS`)
        this.logs.push("")
    }

    /**
     * Log no signal with detailed analysis
     */
    logNoSignal(
        symbol: string,
        reason: string,
        details?: {
            trendScore?: number
            oscillatorScore?: number
            finalScore?: number
            minScoreThreshold?: number
            volumeBonus?: number
            volatilityBonus?: number
            confirmationBonus?: number
            liquidityPass?: boolean
            volatilityPass?: boolean
        }
    ): void {
        this.logs.push(`[${symbol}] ✖ NO SIGNAL`)
        this.logs.push(`  Direction: NONE`)
        this.logs.push(`  Rating: NO TRADE`)

        if (details) {
            // Check if filter failed (hard constraint)
            const hasFilterFailure =
                details.liquidityPass === false ||
                details.volatilityPass === false

            // Show score information
            if (hasFilterFailure) {
                // Don't show numeric score for hard filter failures
                this.logs.push(`  Final Score: N/A (Filtered)`)
                this.logs.push(`  Status: FILTER REJECTED`)
            } else {
                // Show score with correct threshold comparison
                if (
                    details.finalScore !== undefined &&
                    details.minScoreThreshold !== undefined
                ) {
                    const meetsThreshold =
                        details.finalScore >= details.minScoreThreshold
                    const status = meetsThreshold
                        ? "(Meets Threshold)"
                        : "(Below Threshold)"
                    this.logs.push(
                        `  Final Score: ${details.finalScore}/100 ${status}`
                    )
                    this.logs.push(
                        `  Required Score: ≥ ${details.minScoreThreshold}`
                    )
                } else if (details.finalScore !== undefined) {
                    this.logs.push(`  Final Score: ${details.finalScore}/100`)
                }
            }
            this.logs.push(``)

            // Show score breakdown
            if (
                details.trendScore !== undefined &&
                details.oscillatorScore !== undefined
            ) {
                this.logs.push(`  Score Breakdown:`)
                this.logs.push(`    - Trend: ${details.trendScore}/100`)
                this.logs.push(
                    `    - Oscillator: ${details.oscillatorScore}/100`
                )
                if (details.volumeBonus !== undefined) {
                    this.logs.push(
                        `    - Volume Bonus: +${details.volumeBonus}`
                    )
                }
                if (details.volatilityBonus !== undefined) {
                    this.logs.push(
                        `    - Volatility Bonus: +${details.volatilityBonus}`
                    )
                }
                if (details.confirmationBonus !== undefined) {
                    this.logs.push(
                        `    - Confirmation Bonus: +${details.confirmationBonus}`
                    )
                }
                this.logs.push(``)
            }

            // Show failure reasons with hard constraint labels
            if (reason) {
                this.logs.push(`  Failed Conditions:`)

                reason.split("; ").forEach((r) => {
                    if (r.trim()) {
                        // Mark filter failures as hard constraints
                        if (
                            r.includes("volume") ||
                            r.includes("Volatility") ||
                            r.includes("ATR")
                        ) {
                            this.logs.push(
                                `    - ${r.trim()} (hard constraint)`
                            )
                        } else {
                            this.logs.push(`    - ${r.trim()}`)
                        }
                    }
                })
                this.logs.push(``)

                // Add note explaining filter rejection
                if (hasFilterFailure) {
                    this.logs.push(`  Note:`)
                    this.logs.push(
                        `    - Analysis stopped due to hard constraint violation`
                    )
                    this.logs.push(``)
                }
            }

            // Show filters
            if (
                details.liquidityPass !== undefined ||
                details.volatilityPass !== undefined
            ) {
                this.logs.push(`  Filters:`)
                if (details.liquidityPass !== undefined) {
                    const label = details.liquidityPass
                        ? "PASS"
                        : "FAIL (Hard constraint)"
                    this.logs.push(`    - Liquidity: ${label}`)
                }
                if (details.volatilityPass !== undefined) {
                    const label = details.volatilityPass
                        ? "PASS"
                        : "FAIL (Hard constraint)"
                    this.logs.push(`    - Volatility: ${label}`)
                }
            }
        }

        // Track rejection reasons for summary
        if (details?.liquidityPass === false) this.rejectionStats.liquidity++
        if (details?.volatilityPass === false) this.rejectionStats.volatility++
        if (reason.includes("No reversal")) this.rejectionStats.noReversal++
        if (reason.includes("below minimum threshold"))
            this.rejectionStats.lowScore++

        this.logs.push("")
    }

    /**
     * Log error
     */
    logError(symbol: string, error: string): void {
        this.logs.push(`[${symbol}] ⚠ ERROR`)
        this.logs.push(`  Error: ${error}`)
        this.logs.push("")
    }

    /**
     * Log scan summary
     */
    logSummary(totalScanned: number, signalsFound: number): void {
        const duration = Date.now() - this.scanStartTime
        this.logs.push("-".repeat(80))
        this.logs.push("")
        this.logs.push(`SCAN SUMMARY`)
        this.logs.push(`  Total Symbols Scanned: ${totalScanned}`)
        this.logs.push(`  Signals Found: ${signalsFound}`)

        // Add rejection breakdown
        const totalRejected = totalScanned - signalsFound
        if (totalRejected > 0) {
            this.logs.push(`  Rejected: ${totalRejected}`)
            this.logs.push(`  Rejected by:`)
            if (this.rejectionStats.liquidity > 0) {
                this.logs.push(
                    `    - Liquidity: ${this.rejectionStats.liquidity} symbols`
                )
            }
            if (this.rejectionStats.volatility > 0) {
                this.logs.push(
                    `    - Volatility: ${this.rejectionStats.volatility} symbols`
                )
            }
            if (this.rejectionStats.noReversal > 0) {
                this.logs.push(
                    `    - No Reversal: ${this.rejectionStats.noReversal} symbols`
                )
            }
            if (this.rejectionStats.lowScore > 0) {
                this.logs.push(
                    `    - Low Score: ${this.rejectionStats.lowScore} symbols`
                )
            }
        }

        this.logs.push(
            `  Success Rate: ${((signalsFound / totalScanned) * 100).toFixed(
                1
            )}%`
        )
        this.logs.push(`  Scan Duration: ${(duration / 1000).toFixed(2)}s`)
        this.logs.push("")
        this.logs.push("=".repeat(80))
    }

    /**
     * Save log to file
     */
    async saveToFile(filepath: string): Promise<void> {
        try {
            // Ensure directory exists
            const dir = dirname(filepath)
            await mkdir(dir, { recursive: true })

            // Write log file
            await writeFile(filepath, this.logs.join("\n"), "utf-8")
            console.log(`\n📝 Log saved to: ${filepath}`)
        } catch (error) {
            console.error(`Failed to save log: ${error}`)
        }
    }

    /**
     * Get log content as string
     */
    getContent(): string {
        return this.logs.join("\n")
    }
}
