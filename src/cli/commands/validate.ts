/**
 * Validate command - Validate configuration file
 */

import { validateProfile } from "../../config/loader.js"
import { Formatter } from "../../utils/formatter.js"

export async function validateCommand(options: any): Promise<void> {
    try {
        const profilePath = options.profile || "profiles/day.profile.json"

        console.log(Formatter.info(`Validating profile: ${profilePath}`))

        const isValid = await validateProfile(profilePath)

        if (isValid) {
            console.log(
                Formatter.success(`Configuration file is valid: ${profilePath}`)
            )
        } else {
            console.log(
                Formatter.error(`Configuration file is invalid: ${profilePath}`)
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
