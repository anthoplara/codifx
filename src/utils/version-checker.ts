/**
 * Version checker utility
 * Checks if installed version is outdated compared to npm registry
 */

import axios from "axios"

const PACKAGE_NAME = "codifx"
const CHECK_TIMEOUT = 3000 // 3 seconds timeout

/**
 * Compare two semver versions
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split(".").map(Number)
    const parts2 = v2.split(".").map(Number)

    for (let i = 0; i < 3; i++) {
        const num1 = parts1[i] || 0
        const num2 = parts2[i] || 0

        if (num1 > num2) return 1
        if (num1 < num2) return -1
    }

    return 0
}

/**
 * Get latest version from npm registry
 */
async function getLatestVersion(): Promise<string | null> {
    try {
        const response = await axios.get(
            `https://registry.npmjs.org/${PACKAGE_NAME}/latest`,
            { timeout: CHECK_TIMEOUT }
        )
        return response.data.version
    } catch {
        // Silently fail if can't reach npm (offline, timeout, etc)
        return null
    }
}

/**
 * Check if update is available
 * Returns latest version if update needed, null otherwise
 */
export async function checkForUpdates(
    currentVersion: string
): Promise<string | null> {
    const latestVersion = await getLatestVersion()

    if (!latestVersion) {
        return null // Can't check, skip
    }

    const comparison = compareVersions(latestVersion, currentVersion)

    if (comparison > 0) {
        return latestVersion // Update available
    }

    return null // Up to date
}

/**
 * Display update notification and exit
 */
export function displayUpdateNotification(
    currentVersion: string,
    latestVersion: string
): void {
    console.log("")
    console.log("╔═══════════════════════════════════════════════════════╗")
    console.log("║                                                       ║")
    console.log("║        🚀 UPDATE AVAILABLE FOR CODIFX! 🚀            ║")
    console.log("║                                                       ║")
    console.log("╠═══════════════════════════════════════════════════════╣")
    console.log(`║  Current version:  v${currentVersion.padEnd(30)} ║`)
    console.log(`║  Latest version:   v${latestVersion.padEnd(30)} ║`)
    console.log("║                                                       ║")
    console.log("║  Update now to get the latest features and fixes!    ║")
    console.log("║                                                       ║")
    console.log("║  Run:  npm update -g codifx                          ║")
    console.log("║                                                       ║")
    console.log("╚═══════════════════════════════════════════════════════╝")
    console.log("")
    console.log("⚠️  Please update before continuing to ensure compatibility.")
    console.log("")

    process.exit(1)
}
