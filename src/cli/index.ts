/**
 * CLI entry point
 */

import { Command } from "commander"
import { scanCommand } from "./commands/scan.js"
import { simulateCommand } from "./commands/simulate.js"
import { profileCommand } from "./commands/profile.js"
import { validateCommand } from "./commands/validate.js"
import { explainCommand } from "./commands/explain.js"
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

// Get package version
const __dirname = dirname(fileURLToPath(import.meta.url))
const packageJson = JSON.parse(
    readFileSync(join(__dirname, "../../package.json"), "utf-8")
)

const program = new Command()

program
    .name("codifx")
    .description("Professional multi-type trading scanner CLI")
    .version(packageJson.version)

// Global options
program
    .option("--trade-type <type>", "Trading type: scalp, day, or swing")
    .option("--profile <path>", "Path to custom profile configuration")
    .option("--verbose", "Show detailed output")

// Scan command
program
    .command("scan")
    .description("Scan live market data for trading signals")
    .option("-s, --symbol <symbol>", "Single symbol to scan")
    .option("-l, --symbols <symbols...>", "Multiple symbols to scan")
    .option("-t, --trade-type <type>", "Trading type: scalp, day, or swing")
    .option("-p, --profile <path>", "Path to custom profile configuration")
    .option("-w, --watchlist <path>", "Path to custom watchlist JSON file")
    .option("-m, --market <market>", "Market: IDX, NASDAQ, NYSE, CRYPTO", "IDX")
    .option(
        "-d, --direction <direction>",
        "Filter by signal direction: buy, sell, or both",
        "both"
    )
    .option(
        "--date <date>",
        "Historical date for backtesting (YYYY-MM-DD, max 7 days back)"
    )
    .option(
        "--log [filepath]",
        "Save detailed scan log to file (auto-location if no path specified)"
    )
    .option("--html [filepath]", "Generate HTML dashboard and open in browser")
    .action(async (options) => {
        try {
            const globalOpts = program.opts()
            await scanCommand({ ...globalOpts, ...options })
        } catch (error) {
            console.error("✗ Scan failed")
            console.error(
                `✗ ${error instanceof Error ? error.message : String(error)}`
            )
            process.exit(1)
        }
    })

// Simulate command
program
    .command("simulate")
    .description("Run scanner simulation with mock data")
    .action(async () => {
        const globalOpts = program.opts()
        await simulateCommand(globalOpts)
    })

// Profile command
program
    .command("profile")
    .description("Manage configuration profiles")
    .option("-l, --list", "List available profiles")
    .option("-s, --show <name>", "Show profile details")
    .option("-v, --validate <path>", "Validate profile file")
    .action(async (options) => {
        await profileCommand(options)
    })

// Validate command
program
    .command("validate")
    .description("Validate configuration file")
    .option(
        "-p, --profile <path>",
        "Path to profile file (default: profiles/day.profile.json)"
    )
    .action(async (options) => {
        await validateCommand(options)
    })

// Explain command
program
    .command("explain")
    .description("Explain indicator logic and concepts")
    .option("-i, --indicator <name>", "Indicator or concept to explain")
    .action(async (options) => {
        await explainCommand(options)
    })

// Parse arguments
program.parse()
