/**
 * Simulate command - Run scanner with mock data
 */

import type { TradingType } from "../../types/index.js"
import { loadProfile, getProfilePathByType } from "../../config/loader.js"
import { generatePatternedData } from "../../data/mock.js"
import { ScannerEngine } from "../../core/engine.js"
import { TimeframeManager } from "../../core/timeframe.js"
import { ExplainEngine } from "../../utils/explain.js"
import { Formatter } from "../../utils/formatter.js"
import ora from "ora"

export async function simulateCommand(options: {
    tradeType?: TradingType
    profile?: string
    verbose?: boolean
}) {
    const spinner = ora("Initializing simulation").start()

    try {
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

        // Generate mock data
        spinner.start("Generating mock market data")
        const symbols = ["BBRI.JK", "ICBP.JK", "TLKM.JK"]
        const signals = []

        for (const symbol of symbols) {
            spinner.text = `Analyzing ${symbol}`

            // Generate data with oversold reversal pattern
            const primaryData = generatePatternedData("oversold-reversal", 200)
            const confirmationData = generatePatternedData("strong-trend", 200)

            // Analyze
            const analysis = await ScannerEngine.analyze(
                symbol,
                primaryData,
                confirmationData,
                profile
            )

            if (analysis.signal) {
                signals.push(analysis.signal)
            }
        }

        spinner.succeed("Analysis complete")

        // Display results
        if (signals.length === 0) {
            console.log("\n⚠ No signals found meeting criteria\n")
            return
        }

        console.log("\n")
        console.log("═".repeat(110))
        console.log(
            "                                  🎯  TRADING SIGNALS FOUND"
        )
        console.log("═".repeat(110))

        // Table header - all trading levels
        const col1 = "SYMBOL".padEnd(10)
        const col2 = "DIR".padEnd(6)
        const col3 = "SCORE".padEnd(7)
        const col4 = "RATING".padEnd(13)
        const col5 = "ENTRY".padEnd(11)
        const col6 = "SUPPORT".padEnd(11)
        const col7 = "RESIST".padEnd(11)
        const col8 = "SL".padEnd(11)
        const col9 = "TP".padEnd(11)
        const col10 = "RR".padEnd(5)
        const col11 = "WIN%".padEnd(6)

        console.log(
            `${col1} ${col2} ${col3} ${col4} ${col5} ${col6} ${col7} ${col8} ${col9} ${col10} ${col11}`
        )
        console.log("─".repeat(110))

        // Table rows - all trading data
        for (const signal of signals) {
            const symbol = signal.symbol.padEnd(10)
            const direction = (
                signal.direction === "BUY" ? "▲BUY" : "▼SELL"
            ).padEnd(6)
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
            const rr = signal.riskRewardRatio.toFixed(1).padEnd(5)
            const winRate = `${signal.winRate}%`.padEnd(6)

            console.log(
                `${symbol} ${direction} ${score} ${rating} ${entry} ${support} ${resistance} ${sl} ${tp} ${rr} ${winRate}`
            )
        }

        console.log("═".repeat(110))
        console.log(`\n✨ Total signals: ${signals.length}`)
        console.log()

        // Show detailed explanation in verbose mode
        if (options.verbose && signals.length > 0) {
            console.log(Formatter.section("DETAILED SIGNAL EXPLANATION"))
            console.log(ExplainEngine.generateExplanation(signals[0]))
        }
    } catch (error) {
        spinner.fail("Simulation failed")
        if (error instanceof Error) {
            console.error(Formatter.error(error.message))
        }
        process.exit(1)
    }
}
