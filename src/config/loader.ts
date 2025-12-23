/**
 * Configuration profile loader
 */

import { readFile } from "fs/promises"
import { resolve, join } from "path"
import { ProfileSchema } from "./schema.js"
import type { Profile } from "../types/index.js"

const DEFAULT_PROFILE = "day.profile.json"
const PROFILE_DIR = "profiles"

/**
 * Load and validate a configuration profile
 */
export async function loadProfile(profilePath?: string): Promise<Profile> {
    let configPath: string

    if (profilePath) {
        // Use provided path
        configPath = resolve(profilePath)
    } else {
        // Use default profile from package root
        // In production (npm install -g), profiles are in the package directory
        const packageRoot = new URL("../../", import.meta.url).pathname
        configPath = join(packageRoot, PROFILE_DIR, DEFAULT_PROFILE)
    }

    try {
        const content = await readFile(configPath, "utf-8")
        const data = JSON.parse(content)

        // Load global watchlist config if not specified in profile
        if (!data.dataSource) {
            const packageRoot = new URL("../../", import.meta.url).pathname
            const watchlistPath = join(packageRoot, "config", "watchlist.json")

            try {
                const watchlistContent = await readFile(watchlistPath, "utf-8")
                const watchlists = JSON.parse(watchlistContent)

                // Default market preference: IDX > NASDAQ
                const defaultMarket = "IDX"

                // Find watchlist for the default market
                const watchlist = Array.isArray(watchlists)
                    ? watchlists.find((w) => w.market === defaultMarket) ||
                      watchlists[0]
                    : watchlists

                if (watchlist) {
                    data.dataSource = {
                        provider: watchlist.provider,
                        market: watchlist.market,
                        defaultSymbols:
                            watchlist.symbols || watchlist.defaultSymbols,
                    }
                }
            } catch (error) {
                // If global watchlist doesn't exist, it's okay - profile can have its own
            }
        }

        // Validate with Zod schema
        const validated = ProfileSchema.parse(data)

        return validated as Profile
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(
                `Failed to load profile from ${configPath}: ${error.message}`
            )
        }
        throw error
    }
}

/**
 * Validate a profile without loading
 */
export async function validateProfile(profilePath: string): Promise<boolean> {
    try {
        await loadProfile(profilePath)
        return true
    } catch {
        return false
    }
}

/**
 * Get profile path by trading type
 */
export function getProfilePathByType(tradingType: string): string {
    const packageRoot = new URL("../../", import.meta.url).pathname
    return join(packageRoot, PROFILE_DIR, `${tradingType}.profile.json`)
}
