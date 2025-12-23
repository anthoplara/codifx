/**
 * Oscillator Engine - Implements 3-layer logic on primary timeframe
 * Layer 1: Condition (Zone detection)
 * Layer 2: Trigger (Event detection)
 * Layer 3: Confirmation (Validation)
 */

import type { OHLCV, OscillatorLayerResult } from "../types/index.js"
import {
    calculateRSI,
    isRSIOversold,
    isRSIOverbought,
    rsiCrossoverOversold,
    rsiCrossunderOverbought,
} from "../indicators/oscillator/rsi.js"
import {
    calculateStochastic,
    isStochasticOversold,
    isStochasticOverbought,
    stochasticBullishCross,
    stochasticBearishCross,
} from "../indicators/oscillator/stochastic.js"
import {
    calculateMACD,
    macdBullishCross,
    macdBearishCross,
    histogramPositiveChange,
    histogramNegativeChange,
} from "../indicators/oscillator/macd.js"
import {
    calculateMomentum,
    momentumCrossAboveZero,
    momentumCrossBelowZero,
} from "../indicators/oscillator/momentum.js"
import { calculateADX, isStrongTrend } from "../indicators/oscillator/adx.js"
import {
    calculateCCI,
    isCCIOversold,
    isCCIOverbought,
} from "../indicators/oscillator/cci.js"
import {
    calculateWilliamsR,
    isWilliamsROversold,
    isWilliamsROverbought,
} from "../indicators/oscillator/williams.js"

export class OscillatorEngine {
    /**
     * Analyze oscillators with 3-layer logic for BUY signals
     */
    static analyzeBuy(
        primaryData: OHLCV[],
        confirmationData: OHLCV[],
        minADX: number
    ): OscillatorLayerResult {
        const details: string[] = []

        // ===== LAYER 1: CONDITION (Zone Detection) =====
        const conditionDetails: string[] = []
        let conditionCount = 0

        const rsi = calculateRSI(primaryData)
        const latestRSI = rsi[rsi.length - 1]
        if (isRSIOversold(latestRSI)) {
            conditionCount++
            conditionDetails.push(`RSI oversold (${latestRSI.toFixed(1)})`)
        }

        const stoch = calculateStochastic(primaryData)
        const latestStochK = stoch.k[stoch.k.length - 1]
        if (isStochasticOversold(latestStochK)) {
            conditionCount++
            conditionDetails.push(
                `Stochastic oversold (%K: ${latestStochK.toFixed(1)})`
            )
        }

        const cci = calculateCCI(primaryData)
        const latestCCI = cci[cci.length - 1]
        if (isCCIOversold(latestCCI)) {
            conditionCount++
            conditionDetails.push(`CCI oversold (${latestCCI.toFixed(1)})`)
        }

        const williamsR = calculateWilliamsR(primaryData)
        const latestWR = williamsR[williamsR.length - 1]
        if (isWilliamsROversold(latestWR)) {
            conditionCount++
            conditionDetails.push(
                `Williams %R oversold (${latestWR.toFixed(1)})`
            )
        }

        const hasCondition = conditionCount > 0
        if (hasCondition) {
            details.push("🔹 CONDITION: " + conditionDetails.join(", "))
        }

        // ===== LAYER 2: TRIGGER (Event Detection) =====
        const triggerDetails: string[] = []
        let triggerCount = 0

        // RSI crosses above oversold level
        if (rsiCrossoverOversold(rsi)) {
            triggerCount++
            triggerDetails.push("RSI crossed above 30")
        }

        // Stochastic bullish crossover
        if (stochasticBullishCross(stoch.k, stoch.d)) {
            triggerCount++
            triggerDetails.push("Stochastic %K crossed above %D")
        }

        // MACD bullish signals
        const macd = calculateMACD(primaryData)
        if (macdBullishCross(macd.macd, macd.signal)) {
            triggerCount++
            triggerDetails.push("MACD crossed above signal line")
        }
        if (histogramPositiveChange(macd.histogram)) {
            triggerCount++
            triggerDetails.push("MACD histogram turned positive")
        }

        // Momentum crosses above zero
        const momentum = calculateMomentum(primaryData)
        if (momentumCrossAboveZero(momentum)) {
            triggerCount++
            triggerDetails.push("Momentum crossed above 0")
        }

        const hasTrigger = triggerCount > 0
        if (hasTrigger) {
            details.push("🔹 TRIGGER: " + triggerDetails.join(", "))
        }

        // ===== LAYER 3: CONFIRMATION (Validation) =====
        const confirmationDetails: string[] = []
        let confirmationCount = 0

        // ADX trend strength
        const adxResult = calculateADX(confirmationData)
        const latestADX = adxResult.adx[adxResult.adx.length - 1]
        if (!isNaN(latestADX) && isStrongTrend(latestADX)) {
            confirmationCount++
            confirmationDetails.push(
                `ADX > ${minADX} (${latestADX.toFixed(1)})`
            )
        }

        // Momentum confirmation (current value positive)
        const latestMomentum = momentum[momentum.length - 1]
        if (!isNaN(latestMomentum) && latestMomentum > 0) {
            confirmationCount++
            confirmationDetails.push(
                `Momentum positive (${latestMomentum.toFixed(2)})`
            )
        }

        const hasConfirmation = confirmationCount > 0
        if (hasConfirmation) {
            details.push("🔹 CONFIRMATION: " + confirmationDetails.join(", "))
        }

        // ===== SCORING =====
        // Signal is VALID only if we have trigger + confirmation
        const isValid = hasTrigger && hasConfirmation

        let score = 0
        if (isValid) {
            // Weight the components
            const conditionScore = Math.min(conditionCount * 10, 30) // Max 30 points
            const triggerScore = Math.min(triggerCount * 15, 40) // Max 40 points
            const confirmationScore = Math.min(confirmationCount * 15, 30) // Max 30 points
            score = conditionScore + triggerScore + confirmationScore
        }

        return {
            condition: hasCondition,
            trigger: hasTrigger,
            confirmation: hasConfirmation,
            score: Math.min(100, score),
            details,
        }
    }

    /**
     * Analyze oscillators with 3-layer logic for SELL signals
     */
    static analyzeSell(
        primaryData: OHLCV[],
        confirmationData: OHLCV[],
        minADX: number
    ): OscillatorLayerResult {
        const details: string[] = []

        // ===== LAYER 1: CONDITION (Zone Detection) =====
        const conditionDetails: string[] = []
        let conditionCount = 0

        const rsi = calculateRSI(primaryData)
        const latestRSI = rsi[rsi.length - 1]
        if (isRSIOverbought(latestRSI)) {
            conditionCount++
            conditionDetails.push(`RSI overbought (${latestRSI.toFixed(1)})`)
        }

        const stoch = calculateStochastic(primaryData)
        const latestStochK = stoch.k[stoch.k.length - 1]
        if (isStochasticOverbought(latestStochK)) {
            conditionCount++
            conditionDetails.push(
                `Stochastic overbought (%K: ${latestStochK.toFixed(1)})`
            )
        }

        const cci = calculateCCI(primaryData)
        const latestCCI = cci[cci.length - 1]
        if (isCCIOverbought(latestCCI)) {
            conditionCount++
            conditionDetails.push(`CCI overbought (${latestCCI.toFixed(1)})`)
        }

        const williamsR = calculateWilliamsR(primaryData)
        const latestWR = williamsR[williamsR.length - 1]
        if (isWilliamsROverbought(latestWR)) {
            conditionCount++
            conditionDetails.push(
                `Williams %R overbought (${latestWR.toFixed(1)})`
            )
        }

        const hasCondition = conditionCount > 0
        if (hasCondition) {
            details.push("🔹 CONDITION: " + conditionDetails.join(", "))
        }

        // ===== LAYER 2: TRIGGER (Event Detection) =====
        const triggerDetails: string[] = []
        let triggerCount = 0

        if (rsiCrossunderOverbought(rsi)) {
            triggerCount++
            triggerDetails.push("RSI crossed below 70")
        }

        if (stochasticBearishCross(stoch.k, stoch.d)) {
            triggerCount++
            triggerDetails.push("Stochastic %K crossed below %D")
        }

        const macd = calculateMACD(primaryData)
        if (macdBearishCross(macd.macd, macd.signal)) {
            triggerCount++
            triggerDetails.push("MACD crossed below signal line")
        }
        if (histogramNegativeChange(macd.histogram)) {
            triggerCount++
            triggerDetails.push("MACD histogram turned negative")
        }

        const momentum = calculateMomentum(primaryData)
        if (momentumCrossBelowZero(momentum)) {
            triggerCount++
            triggerDetails.push("Momentum crossed below 0")
        }

        const hasTrigger = triggerCount > 0
        if (hasTrigger) {
            details.push("🔹 TRIGGER: " + triggerDetails.join(", "))
        }

        // ===== LAYER 3: CONFIRMATION =====
        const confirmationDetails: string[] = []
        let confirmationCount = 0

        const adxResult = calculateADX(confirmationData)
        const latestADX = adxResult.adx[adxResult.adx.length - 1]
        if (!isNaN(latestADX) && isStrongTrend(latestADX)) {
            confirmationCount++
            confirmationDetails.push(
                `ADX > ${minADX} (${latestADX.toFixed(1)})`
            )
        }

        const latestMomentum = momentum[momentum.length - 1]
        if (!isNaN(latestMomentum) && latestMomentum < 0) {
            confirmationCount++
            confirmationDetails.push(
                `Momentum negative (${latestMomentum.toFixed(2)})`
            )
        }

        const hasConfirmation = confirmationCount > 0
        if (hasConfirmation) {
            details.push("🔹 CONFIRMATION: " + confirmationDetails.join(", "))
        }

        // ===== SCORING =====
        const isValid = hasTrigger && hasConfirmation

        let score = 0
        if (isValid) {
            const conditionScore = Math.min(conditionCount * 10, 30)
            const triggerScore = Math.min(triggerCount * 15, 40)
            const confirmationScore = Math.min(confirmationCount * 15, 30)
            score = conditionScore + triggerScore + confirmationScore
        }

        return {
            condition: hasCondition,
            trigger: hasTrigger,
            confirmation: hasConfirmation,
            score: Math.min(100, score),
            details,
        }
    }
}
