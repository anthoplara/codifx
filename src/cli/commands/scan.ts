/**
 * Scan command - Scan live market data
 */

import type { TradingType } from "../../types/index.js"
import { loadProfile, getProfilePathByType } from "../../config/loader.js"
import { YahooFinanceProvider } from "../../data/yahoo.js"
import { ScannerEngine } from "../../core/engine.js"
import { TimeframeManager } from "../../core/timeframe.js"
import { ExplainEngine } from "../../utils/explain.js"
import { Formatter } from "../../utils/formatter.js"
import { normalizeSymbols, type Market } from "../../utils/symbols.js"
import { ScanLogger } from "../../utils/logger.js"
import { getDefaultLogPath } from "../../utils/paths.js"
import ora from "ora"
import { HTMLGenerator } from "../../utils/html-generator.js"

export async function scanCommand(options: {
    tradeType?: TradingType
    profile?: string
    symbol?: string
    symbols?: string[]
    market?: Market
    direction?: string
    verbose?: boolean
    log?: string | boolean
    html?: string | boolean
    date?: string
}) {
    const spinner = ora("Initializing scanner").start()

    try {
        // Validate and parse date parameter
        let targetDate: Date | undefined
        if (options.date) {
            targetDate = new Date(options.date)

            // Validate date format
            if (isNaN(targetDate.getTime())) {
                throw new Error(
                    "Invalid date format. Use YYYY-MM-DD (e.g., 2025-12-22)"
                )
            }

            // Validate max 7 days back
            const today = new Date()
            today.setHours(0, 0, 0, 0) // Reset to start of day
            targetDate.setHours(23, 59, 59, 999) // Set to end of day

            const daysDiff = Math.floor(
                (today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)
            )

            if (daysDiff < 0) {
                throw new Error("Date cannot be in the future")
            }
            if (daysDiff > 7) {
                throw new Error("Date cannot be more than 7 days back")
            }

            spinner.info(`Historical scan for date: ${options.date}`)
        }

        // Validate direction parameter
        const directionFilter = options.direction?.toLowerCase() || "both"
        if (!["buy", "sell", "both"].includes(directionFilter)) {
            throw new Error(
                `Invalid direction: ${options.direction}. Must be 'buy', 'sell', or 'both'`
            )
        }

        // Load profile
        let profilePath: string | undefined
        if (options.profile) {
            profilePath = options.profile
        } else if (options.tradeType) {
            profilePath = getProfilePathByType(options.tradeType)
        }

        spinner.text = "Loading profile"
        const profile = await loadProfile(profilePath)
        spinner.succeed(`Loaded profile: ${profile.tradingType}`)

        // Initialize data provider
        const provider = new YahooFinanceProvider()

        spinner.start("Checking data provider availability")
        const available = await provider.isAvailable()
        if (!available) {
            throw new Error("Yahoo Finance API is not available")
        }
        spinner.succeed("Data provider ready")

        // Get symbols to scan
        let symbols: string[] = []
        if (options.symbol) {
            symbols = [options.symbol]
        } else if (options.symbols) {
            symbols = options.symbols
        } else {
            // Use default symbols from profile or fallback
            symbols = profile.dataSource?.defaultSymbols || [
                "AAPL",
                "MSFT",
                "GOOGL",
            ]
        }

        // Use default symbols if none specified
        if (!symbols || symbols.length === 0) {
            symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]
        }

        // Get market from options or profile
        const market = options.market || profile.dataSource?.market || "NASDAQ"

        // Normalize symbols with market suffix
        symbols = normalizeSymbols(symbols, market)
        if (market !== "NASDAQ") {
            console.log(Formatter.info(`Market: ${market}`))
        }

        // Get timeframe configuration
        const primaryTF = TimeframeManager.getPrimaryTimeframe(
            profile.tradingType
        )
        const confirmationTF = TimeframeManager.getConfirmationTimeframe(
            profile.tradingType
        )

        console.log(Formatter.info(`Primary timeframe: ${primaryTF}`))
        console.log(Formatter.info(`Confirmation timeframe: ${confirmationTF}`))
        console.log("")

        // Initialize logger if requested
        let logger: ScanLogger | null = null
        let logPath: string | null = null

        if (options.log) {
            logger = new ScanLogger()
            logPath =
                typeof options.log === "string"
                    ? options.log
                    : getDefaultLogPath()
            if (logger) {
                logger.logStart(
                    profile.tradingType,
                    {
                        primary: profile.timeframes.primary,
                        confirmation: profile.timeframes.confirmation,
                    },
                    symbols
                )
            }
        }

        // Scan symbols with visual progress bar
        const signals = []
        const dataCount = TimeframeManager.getDataPointCount(primaryTF)
        const totalSymbols = symbols.length
        let signalCount = 0
        const scanStartTime = Date.now()

        // Import progress bar
        const cliProgress = await import("cli-progress")
        const progressBar = new cliProgress.SingleBar({
            format: "🔍 Scanning |{bar}| {percentage}% | {value}/{total} symbols | {status}",
            barCompleteChar: "\u2588",
            barIncompleteChar: "\u2591",
            hideCursor: true,
        })

        console.log("")
        progressBar.start(totalSymbols, 0, { status: "Starting..." })

        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i]

            progressBar.update(i, { status: `Analyzing ${symbol}...` })

            try {
                // Fetch data
                const primaryData = await provider.fetchOHLCV(
                    symbol,
                    primaryTF,
                    dataCount,
                    targetDate
                )
                const confirmationData = await provider.fetchOHLCV(
                    symbol,
                    confirmationTF,
                    dataCount,
                    targetDate
                )

                // Analyze
                const analysis = await ScannerEngine.analyze(
                    symbol,
                    primaryData,
                    confirmationData,
                    profile
                )

                if (analysis.signal) {
                    // Filter by direction if specified
                    const shouldInclude =
                        directionFilter === "both" ||
                        analysis.signal.direction.toLowerCase() ===
                            directionFilter

                    if (shouldInclude) {
                        signalCount++
                        progressBar.update(i + 1, {
                            status: `✨ ${symbol}: ${analysis.signal.direction} signal found!`,
                        })
                        signals.push(analysis.signal)

                        if (logger) {
                            logger.logSignal(analysis.signal)
                        }
                    } else {
                        progressBar.update(i + 1, {
                            status: `${symbol}: ${analysis.signal.direction} (filtered)`,
                        })
                    }
                } else {
                    progressBar.update(i + 1, {
                        status: `${symbol}: No signal`,
                    })

                    if (logger) {
                        logger.logNoSignal(
                            symbol,
                            analysis.failureReasons.join("; ") ||
                                "No signal detected",
                            {
                                trendScore: analysis.trendScore,
                                oscillatorScore: analysis.oscillatorScore,
                                finalScore: analysis.finalScore,
                                minScoreThreshold: analysis.minScoreThreshold,
                                volumeBonus: analysis.volumeBonus,
                                volatilityBonus: analysis.volatilityBonus,
                                confirmationBonus: analysis.confirmationBonus,
                                liquidityPass: analysis.liquidityPass,
                                volatilityPass: analysis.volatilityPass,
                            }
                        )
                    }
                }
            } catch (error) {
                if (error instanceof Error) {
                    progressBar.update(i + 1, {
                        status: `⚠ ${symbol}: ${error.message}`,
                    })

                    if (logger) {
                        logger.logError(symbol, error.message)
                    }
                }
            }
        }

        // Update to completed status
        progressBar.update(totalSymbols, { status: "Completed!" })
        progressBar.stop()

        // Show scan summary
        const totalElapsedMs = Date.now() - scanStartTime
        const totalElapsedSec = (totalElapsedMs / 1000).toFixed(2)

        console.log(`\n📊 Scan Summary`)
        console.log(`   ⏱  Duration: ${totalElapsedSec}s`)
        console.log(`   📈 Signals found: ${signalCount}/${totalSymbols}`)
        if (signalCount > 0) {
            console.log(
                `   ✅ Success rate: ${(
                    (signalCount / totalSymbols) *
                    100
                ).toFixed(1)}%`
            )
        }

        // Display results
        if (signals.length === 0) {
            console.log("\n⚠ No signals found meeting criteria\n")
            if (logger) {
                await logger.saveToFile(
                    typeof options.log === "string"
                        ? options.log
                        : getDefaultLogPath()
                )
            }
            return
        }

        console.log("\n")
        console.log("═".repeat(114))
        console.log("TRADING SIGNALS FOUND".padStart(67).padEnd(114))
        console.log("═".repeat(114))

        // Table header - all trading levels
        const col1 = "SYMBOL".padEnd(10)
        const col2 = "DIR".padEnd(8)
        const col3 = "SCORE".padEnd(7)
        const col4 = "RATING".padEnd(13)
        const col5 = "ENTRY".padEnd(11)
        const col6 = "SUPPORT".padEnd(11)
        const col7 = "RESIST".padEnd(11)
        const col8 = "SL".padEnd(11)
        const col9 = "TP".padEnd(11)
        const col10 = "RR".padEnd(7)
        const col11 = "WIN%".padEnd(6)

        console.log(
            `${col1} ${col2} ${col3} ${col4} ${col5} ${col6} ${col7} ${col8} ${col9} ${col10} ${col11}`
        )
        console.log("─".repeat(114))

        // Table rows - all trading data
        for (const signal of signals) {
            const symbol = signal.symbol.padEnd(10)
            const direction = (
                signal.direction === "BUY" ? "▲ BUY" : "▼ SELL"
            ).padEnd(8)
            const score = signal.score.toString().padEnd(7)
            const rating = signal.rating.padEnd(13)

            // Format prices
            const formatPrice = (price: number) => {
                if (price >= 1000) {
                    return `Rp ${Math.round(price).toLocaleString("id-ID")}`
                }
                return `Rp ${price.toFixed(0)}`
            }

            const entry = formatPrice(signal.entry).padEnd(11)
            const support = formatPrice(signal.support).padEnd(11)
            const resistance = formatPrice(signal.resistance).padEnd(11)
            const sl = formatPrice(signal.stopLoss).padEnd(11)
            const tp = formatPrice(signal.takeProfit).padEnd(11)
            const rr = signal.riskRewardRatio.toFixed(1).padEnd(7)
            const winRate = `${signal.winRate}%`.padEnd(6)

            console.log(
                `${symbol} ${direction} ${score} ${rating} ${entry} ${support} ${resistance} ${sl} ${tp} ${rr} ${winRate}`
            )
        }

        console.log("═".repeat(114))
        console.log(`\n✨ Total signals: ${signals.length}`)
        console.log()

        // Show detailed explanation in verbose mode
        if (options.verbose && signals.length > 0) {
            console.log(Formatter.section("DETAILED SIGNAL EXPLANATION"))
            console.log(ExplainEngine.generateExplanation(signals[0]))
        }

        // Generate HTML dashboard if --html flag is present
        if (options.html !== undefined && signals.length > 0) {
            try {
                const htmlPath =
                    typeof options.html === "string" && options.html !== ""
                        ? options.html
                        : undefined

                const outputPath = await HTMLGenerator.generateDashboard(
                    signals,
                    htmlPath
                )

                await HTMLGenerator.openInBrowser(outputPath)
            } catch (error) {
                // Silent fail - HTML generation is optional
            }
        }

        // Save log if enabled
        if (logger && logPath) {
            logger.logSummary(symbols.length, signals.length)
            await logger.saveToFile(logPath)
        }
    } catch (error) {
        spinner.fail("Scan failed")
        if (error instanceof Error) {
            console.error(Formatter.error(error.message))
        }
        process.exit(1)
    }
}
