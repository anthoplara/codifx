/**
 * Profile command - Manage configuration profiles
 */

import { readdir } from "fs/promises"
import { join } from "path"
import { loadProfile, validateProfile } from "../../config/loader.js"
import { Formatter } from "../../utils/formatter.js"

export async function profileCommand(options: {
    list?: boolean
    show?: string
    validate?: string
}) {
    try {
        if (options.list) {
            // List available profiles
            const packageRoot = new URL("../../../", import.meta.url).pathname
            const profileDir = join(packageRoot, "profiles")

            const files = await readdir(profileDir)
            const profiles = files.filter((f) => f.endsWith(".profile.json"))

            console.log(Formatter.section("AVAILABLE PROFILES"))
            profiles.forEach((p) => {
                console.log(Formatter.info(p.replace(".profile.json", "")))
            })
        } else if (options.show) {
            // Show profile details - allow short names like "day" or full paths
            let profilePath = options.show
            if (!profilePath.includes("/") && !profilePath.endsWith(".json")) {
                // Short name provided, resolve to full path
                profilePath = `profiles/${profilePath}.profile.json`
            }

            const profile = await loadProfile(profilePath)

            console.log(
                Formatter.section(
                    `PROFILE: ${profile.tradingType.toUpperCase()}`
                )
            )
            console.log(JSON.stringify(profile, null, 2))
        } else if (options.validate) {
            // Validate profile
            const isValid = await validateProfile(options.validate)

            if (isValid) {
                console.log(Formatter.success("Profile is valid"))
            } else {
                console.log(Formatter.error("Profile validation failed"))
                process.exit(1)
            }
        } else {
            console.log(
                Formatter.error(
                    "Please specify an action: --list, --show, or --validate"
                )
            )
            process.exit(1)
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error(Formatter.error(error.message))
        }
        process.exit(1)
    }
}
