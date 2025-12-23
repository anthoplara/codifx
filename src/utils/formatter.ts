/**
 * Output formatters for CLI
 */

import chalk from "chalk"
import type { TradingSignal, Rating } from "../types/index.js"

export class Formatter {
    /**
     * Format rating with color
     */
    static rating(rating: Rating): string {
        switch (rating) {
            case "STRONG BUY":
                return chalk.green.bold(rating)
            case "BUY":
                return chalk.green(rating)
            case "SPECULATIVE":
                return chalk.yellow(rating)
            case "NO TRADE":
                return chalk.red(rating)
        }
    }

    /**
     * Format score with color
     */
    static score(score: number): string {
        if (score >= 85) return chalk.green.bold(score.toString())
        if (score >= 75) return chalk.green(score.toString())
        if (score >= 65) return chalk.yellow(score.toString())
        return chalk.red(score.toString())
    }

    /**
     * Format direction with color
     */
    static direction(direction: string): string {
        if (direction === "BUY") return chalk.green("▲ " + direction)
        if (direction === "SELL") return chalk.red("▼ " + direction)
        return chalk.gray("─ " + direction)
    }

    /**
     * Format symbol
     */
    static symbol(symbol: string): string {
        return chalk.cyan.bold(symbol)
    }

    /**
     * Format signal for table display
     */
    static formatSignalRow(signal: TradingSignal): string {
        const parts = [
            signal.symbol.padEnd(12),
            this.direction(signal.direction).padEnd(15),
            this.score(signal.score).toString().padEnd(15),
            signal.rating.padEnd(15),
        ]
        return parts.join("")
    }

    /**
     * Format table header
     */
    static tableHeader(): string {
        const header = [
            chalk.bold("SYMBOL".padEnd(12)),
            chalk.bold("DIRECTION".padEnd(15)),
            chalk.bold("SCORE".padEnd(10)),
            chalk.bold("RATING".padEnd(15)),
        ].join(" ")
        return header + "\n" + "─".repeat(60)
    }

    /**
     * Format error message
     */
    static error(message: string): string {
        return chalk.red("✗ ") + message
    }

    /**
     * Format success message
     */
    static success(message: string): string {
        return chalk.green("✓ ") + message
    }

    /**
     * Format info message
     */
    static info(message: string): string {
        return chalk.blue("ℹ ") + message
    }

    /**
     * Format warning message
     */
    static warning(message: string): string {
        return chalk.yellow("⚠ ") + message
    }

    /**
     * Format section header
     */
    static section(title: string): string {
        return "\n" + chalk.bold.cyan(title) + "\n" + "─".repeat(title.length)
    }
}
