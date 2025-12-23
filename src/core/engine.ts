/**
 * Main scanner engine
 */

import type {
    OHLCV,
    Profile,
    SignalDirection,
    AnalysisResult,
    TradingSignal,
} from "../types/index.js"
import { TrendEngine } from "./trend-engine.js"
import { OscillatorEngine } from "./oscillator-engine.js"
import { Filters } from "./filters.js"
import { ScoringEngine, RatingEngine } from "./scoring.js"
import { average } from "../utils/indicators.js"
import { getLatestATR } from "../indicators/oscillator/atr.js"
import { LevelCalculator } from "../utils/levels.js"

export class ScannerEngine {
    /**
     * Analyze a symbol for trading signals (returns comprehensive analysis data)
     */
    static async analyze(
        symbol: string,
        primaryData: OHLCV[],
        confirmationData: OHLCV[],
        profile: Profile
    ): Promise<AnalysisResult> {
        const failureReasons: string[] = []

        // Apply filters and track individually
        const liquidityResult = Filters.checkLiquidity(
            primaryData,
            profile.filters.minVolume
        )
        const volatilityResult = Filters.checkVolatility(
            primaryData,
            profile.filters.atrMinPercent,
            profile.filters.atrMaxPercent
        )

        const liquidityPass = liquidityResult.passed
        const volatilityPass = volatilityResult.passed
        const filtersPass = liquidityPass && volatilityPass

        // Track filter failures
        if (!liquidityPass && liquidityResult.reason) {
            failureReasons.push(liquidityResult.reason)
        }
        if (!volatilityPass && volatilityResult.reason) {
            failureReasons.push(volatilityResult.reason)
        }

        // Analyze trend on confirmation timeframe
        const trendResult = TrendEngine.analyze(
            confirmationData,
            profile.indicators.trend,
            profile.tradingType
        )

        // Analyze oscillators on primary timeframe for both buy and sell
        const buyOscillators = OscillatorEngine.analyzeBuy(
            primaryData,
            confirmationData,
            profile.filters.minADX
        )

        const sellOscillators = OscillatorEngine.analyzeSell(
            primaryData,
            confirmationData,
            profile.filters.minADX
        )

        // Determine the stronger signal
        let oscillatorResult = buyOscillators
        let direction: SignalDirection = "BUY"

        if (sellOscillators.score > buyOscillators.score) {
            oscillatorResult = sellOscillators
            direction = "SELL"
        }

        // Track oscillator failures
        if (oscillatorResult.score === 0) {
            failureReasons.push("No reversal signals detected in oscillators")
        }

        // Calculate bonuses
        const currentVolume = primaryData[primaryData.length - 1].volume
        const avgVolume = average(primaryData.map((d) => d.volume))
        const volumeBonus = ScoringEngine.calculateVolumeBonus(
            currentVolume,
            avgVolume,
            profile.tradingType
        )

        const atr = getLatestATR(primaryData, 14)
        const avgPrice = average(primaryData.map((d) => d.close))
        const volatilityBonus = ScoringEngine.calculateVolatilityBonus(
            atr,
            avgPrice,
            profile.tradingType
        )

        const primaryDirectionBullish = direction === "BUY"
        const confirmationDirectionBullish = trendResult.direction === "BUY"
        const confirmationBonus = ScoringEngine.calculateConfirmationBonus(
            primaryDirectionBullish,
            confirmationDirectionBullish,
            profile.tradingType
        )

        // Calculate final score
        const scoreResult = ScoringEngine.calculateScore(
            trendResult.score,
            oscillatorResult.score,
            profile.tradingType,
            volumeBonus,
            volatilityBonus,
            confirmationBonus
        )

        // Get minimum threshold
        const minScoreThreshold = RatingEngine.getMinimumThreshold(
            profile.tradingType
        )

        // Check minimum score threshold
        const meetsThreshold = RatingEngine.meetsMinimumScore(
            scoreResult.finalScore,
            profile.tradingType
        )

        if (!meetsThreshold) {
            failureReasons.push(
                `Score ${scoreResult.finalScore} below minimum threshold ${minScoreThreshold}`
            )
        }

        // Build comprehensive analysis result
        let analysisResult: AnalysisResult = {
            trendScore: trendResult.score,
            oscillatorScore: oscillatorResult.score,
            finalScore: scoreResult.finalScore,
            volumeBonus,
            volatilityBonus,
            confirmationBonus,
            liquidityPass,
            volatilityPass,
            trendDetails: trendResult.details,
            oscillatorDetails: oscillatorResult.details,
            signal: null,
            failureReasons,
            minScoreThreshold,
        }

        // If all checks passed, create signal if all criteria met
        if (filtersPass && oscillatorResult.score > 0 && meetsThreshold) {
            const rating = RatingEngine.assignRating(scoreResult.finalScore)
            const explanation = this.generateExplanation(
                profile.tradingType,
                direction,
                trendResult,
                oscillatorResult,
                scoreResult
            )

            const signal: TradingSignal = {
                symbol,
                direction,
                score: scoreResult.finalScore,
                rating,
                timestamp: primaryData[primaryData.length - 1].timestamp,
                timeframe: profile.timeframes.primary,
                price: primaryData[primaryData.length - 1].close,
                trendScore: trendResult.score,
                oscillatorScore: oscillatorResult.score,
                volumeBonus,
                volatilityBonus,
                confirmationBonus,
                trendDetails: trendResult.details,
                oscillatorDetails: oscillatorResult.details,
                tradingType: profile.tradingType,
                explanation,

                // Trading Levels
                entry: primaryData[primaryData.length - 1].close,
                support: LevelCalculator.calculateSupport(
                    primaryData,
                    primaryData[primaryData.length - 1].close
                ),
                resistance: LevelCalculator.calculateResistance(
                    primaryData,
                    primaryData[primaryData.length - 1].close
                ),
                stopLoss: LevelCalculator.calculateStopLoss(
                    primaryData[primaryData.length - 1].close,
                    atr,
                    direction,
                    2.0
                ),
                takeProfit: LevelCalculator.calculateTakeProfit(
                    primaryData[primaryData.length - 1].close,
                    LevelCalculator.calculateStopLoss(
                        primaryData[primaryData.length - 1].close,
                        atr,
                        direction,
                        2.0
                    ),
                    direction,
                    2.0
                ),

                // Risk Management
                winRate: LevelCalculator.estimateWinRate(
                    scoreResult.finalScore,
                    confirmationBonus,
                    volumeBonus
                ),
                riskRewardRatio: 2.0,

                details: {
                    trend: trendResult,
                    oscillators: oscillatorResult,
                    filters: {
                        liquidity: liquidityPass,
                        volatilityPass: volatilityPass,
                    },
                },
            }

            analysisResult = {
                trendScore: trendResult.score,
                oscillatorScore: oscillatorResult.score,
                finalScore: scoreResult.finalScore,
                volumeBonus,
                volatilityBonus,
                confirmationBonus,
                liquidityPass,
                volatilityPass,
                trendDetails: trendResult.details,
                oscillatorDetails: oscillatorResult.details,
                signal,
                failureReasons,
                minScoreThreshold,
            }
        }

        return analysisResult
    }

    /**
     * Generate explanation text
     */
    private static generateExplanation(
        _tradingType: string,
        direction: SignalDirection,
        trendResult: any,
        oscillatorResult: any,
        scoreResult: any
    ): string {
        const parts: string[] = []

        // Trend summary
        if (trendResult.score > 60) {
            parts.push(
                `${
                    direction === "BUY" ? "Bullish" : "Bearish"
                } trend confirmed on higher timeframe`
            )
        } else if (trendResult.score > 30) {
            parts.push("Mixed trend signals")
        }

        // Oscillator summary
        if (oscillatorResult.trigger) {
            parts.push(
                direction === "BUY"
                    ? "reversal signals detected"
                    : "weakness signals detected"
            )
        }

        // Confirmation
        if (oscillatorResult.confirmation) {
            parts.push("momentum and trend strength support the move")
        }

        // Volume
        if (scoreResult.volumeBonus > 5) {
            parts.push("above-average volume")
        }

        return parts.length > 0
            ? parts.join(", ") + "."
            : "Signal detected based on indicators."
    }
}
