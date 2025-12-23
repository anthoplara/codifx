/**
 * HTML Generator - Generate HTML dashboard from scan results
 */

import { readFile, writeFile } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"
import type { TradingSignal } from "../types/index.js"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export class HTMLGenerator {
    /**
     * Generate HTML dashboard from trading signals
     */
    static async generateDashboard(
        signals: TradingSignal[],
        outputPath?: string
    ): Promise<string> {
        // Default output path - use OS temp directory with fixed filename
        const htmlPath = outputPath || join(tmpdir(), `codifx-dashboard.html`)

        // Load template
        const templatePath = join(
            new URL("../../templates/", import.meta.url).pathname,
            "dashboard.html"
        )
        let template = await readFile(templatePath, "utf-8")

        // Calculate stats
        const totalSignals = signals.length
        const buySignals = signals.filter((s) => s.direction === "BUY").length
        const sellSignals = signals.filter((s) => s.direction === "SELL").length
        const avgScore =
            totalSignals > 0
                ? Math.round(
                      signals.reduce((sum, s) => sum + s.score, 0) /
                          totalSignals
                  )
                : 0

        // Format scan time
        const scanTime = new Date().toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
        })

        // Helper function to convert symbol to TradingView format
        const convertSymbolToTradingView = (symbol: string): string => {
            if (symbol.endsWith(".JK")) {
                const baseSymbol = symbol.replace(".JK", "")
                return `IDX:${baseSymbol}`
            }
            // Add other market conversions if needed
            return symbol
        }

        // Transform signals to template format
        const stockData = signals.map((signal) => ({
            symbol: convertSymbolToTradingView(signal.symbol),
            originalSymbol: signal.symbol, // Keep original for internal use if needed
            direction: signal.direction,
            rating: signal.rating,
            finalScore: signal.score,
            breakdown: {
                trend: signal.trendScore,
                oscillator: signal.oscillatorScore,
                volumeBonus: signal.volumeBonus,
                volatilityBonus: signal.volatilityBonus,
                confirmationBonus: signal.confirmationBonus,
            },
            trendDetails: signal.trendDetails,
            oscillatorDetails: signal.oscillatorDetails,
            filters: {
                liquidity: signal.details.filters.liquidity,
                volatility: signal.details.filters.volatilityPass,
            },
            // Trading levels
            entry: signal.entry,
            stopLoss: signal.stopLoss,
            takeProfit: signal.takeProfit,
            support: signal.support,
            resistance: signal.resistance,
            riskRewardRatio: signal.riskRewardRatio,
            winRate: signal.winRate,
        }))

        // Replace placeholders
        template = template.replace("{{SCAN_TIME}}", scanTime)
        template = template.replace(
            "{{TOTAL_SIGNALS}}",
            totalSignals.toString()
        )
        template = template.replace("{{BUY_SIGNALS}}", buySignals.toString())
        template = template.replace("{{SELL_SIGNALS}}", sellSignals.toString())
        template = template.replace("{{AVG_SCORE}}", avgScore.toString())
        template = template.replace(
            "{{STOCK_DATA}}",
            JSON.stringify(stockData, null, 2)
        )

        // Write HTML file
        await writeFile(htmlPath, template, "utf-8")

        return htmlPath
    }

    /**
     * Open HTML file in default browser
     */
    static async openInBrowser(htmlPath: string): Promise<void> {
        const platform = process.platform

        try {
            if (platform === "darwin") {
                // macOS
                await execAsync(`open "${htmlPath}"`)
            } else if (platform === "win32") {
                // Windows
                await execAsync(`start "" "${htmlPath}"`)
            } else {
                // Linux
                await execAsync(`xdg-open "${htmlPath}"`)
            }
        } catch (error) {
            console.error("Failed to open browser:", error)
            throw new Error(
                `Could not open browser automatically. Please open: ${htmlPath}`
            )
        }
    }
}
