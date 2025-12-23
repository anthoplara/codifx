/**
 * Get OS-specific safe paths for log files
 */

import { homedir, tmpdir } from "os"
import { join } from "path"

/**
 * Get default log directory based on OS
 * Uses XDG_DATA_HOME on Linux, ~/Library/Logs on macOS, temp on Windows
 */
export function getDefaultLogDir(): string {
    const platform = process.platform

    if (platform === "darwin") {
        // macOS: ~/Library/Logs/codifx
        return join(homedir(), "Library", "Logs", "codifx")
    } else if (platform === "linux") {
        // Linux: ~/.local/share/codifx/logs or $XDG_DATA_HOME/codifx/logs
        const xdgDataHome =
            process.env.XDG_DATA_HOME || join(homedir(), ".local", "share")
        return join(xdgDataHome, "codifx", "logs")
    } else {
        // Windows: %TEMP%\codifx\logs
        return join(tmpdir(), "codifx", "logs")
    }
}

/**
 * Get full default log path with fixed filename
 */
export function getDefaultLogPath(): string {
    return join(tmpdir(), "codifx-scan.log")
}
