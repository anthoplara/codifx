/**
 * Explain command - Explain indicator logic
 */

import { Formatter } from "../../utils/formatter.js"
import { INDICATOR_PARAMS } from "../../utils/constants.js"

const EXPLANATIONS: Record<string, string> = {
    rsi: `RSI (Relative Strength Index)
  
📊 What it measures:
Momentum oscillator measuring the speed and magnitude of price changes.

🔹 3-Layer Logic for BUY:
  Layer 1 (CONDITION): RSI < 30 (oversold zone)
  Layer 2 (TRIGGER): RSI crosses ABOVE 30 (reversal confirmation)
  Layer 3 (CONFIRMATION): ADX > 20 + bullish trend on higher timeframe

⚠️ CRITICAL: Being oversold (RSI < 30) is NOT an entry signal!
We need confirmation of reversal (crossing above 30) AND trend strength.

📈 Parameters: Period = ${INDICATOR_PARAMS.RSI.period}`,

    stochastic: `Stochastic Oscillator

📊 What it measures:
Compares closing price to price range over a period.

🔹 3-Layer Logic for BUY:
  Layer 1 (CONDITION): %K < 20 (oversold zone)
  Layer 2 (TRIGGER): %K crosses ABOVE %D (bullish crossover)
  Layer 3 (CONFIRMATION): ADX > 20 + momentum positive

⚠️ CRITICAL: Oversold condition alone is not enough!
We wait for the bullish crossover to confirm reversal intent.

📈 Parameters: K=${INDICATOR_PARAMS.STOCHASTIC.kPeriod}, D=${INDICATOR_PARAMS.STOCHASTIC.dPeriod}, Smooth=${INDICATOR_PARAMS.STOCHASTIC.smooth}`,

    macd: `MACD (Moving Average Convergence Divergence)

📊 What it measures:
Relationship between two moving averages of price.

🔹 3-Layer Logic for BUY:
  Layer 1 (CONDITION): Histogram in negative zone
  Layer 2 (TRIGGER): MACD crosses above signal line OR histogram turns positive
  Layer 3 (CONFIRMATION): ADX > 20 + momentum confirms

💡 Strength: Shows both trend direction and momentum.

📈 Parameters: Fast=${INDICATOR_PARAMS.MACD.fastPeriod}, Slow=${INDICATOR_PARAMS.MACD.slowPeriod}, Signal=${INDICATOR_PARAMS.MACD.signalPeriod}`,

    adx: `ADX (Average Directional Index)

📊 What it measures:
Trend strength (NOT direction).

🎯 Usage in codifx:
ADX is used in Layer 3 (CONFIRMATION) to validate signal quality.

✓ ADX > ${INDICATOR_PARAMS.ADX.threshold}: Strong trend (signal is reliable)
✗ ADX < ${INDICATOR_PARAMS.ADX.threshold}: Weak trend (signal rejected)

💡 Key insight: Oscillator signals in strong trends are more reliable.

📈 Parameters: Period = ${INDICATOR_PARAMS.ADX.period}`,

    momentum: `Momentum Indicator

📊 What it measures:
Rate of price change over a period.

🔹 Usage in codifx:
Momentum is used for TRIGGER and CONFIRMATION detection.

  Trigger: Momentum crosses above 0 (bullish) or below 0 (bearish)
  Confirmation: Momentum > 0 supports bullish signals

💡 Simple but effective for confirming price acceleration.

📈 Parameters: Period = ${INDICATOR_PARAMS.MOMENTUM.period}`,

    cci: `CCI (Commodity Channel Index)

📊 What it measures:
Deviation of price from its statistical mean.

🔹 3-Layer Logic for BUY:
  Layer 1 (CONDITION): CCI < -100 (oversold)
  Layer 2 (TRIGGER): Other oscillators provide trigger
  Layer 3 (CONFIRMATION): ADX + momentum

💡 Effective in trending markets for extreme condition detection.

📈 Parameters: Period = ${INDICATOR_PARAMS.CCI.period}`,

    williams: `Williams %R

📊 What it measures:
Current closing price relative to the high-low range.

🔹 3-Layer Logic for BUY:
  Layer 1 (CONDITION): %R < -80 (oversold)
  Layer 2 (TRIGGER): Other oscillators provide trigger
  Layer 3 (CONFIRMATION): ADX + momentum

💡 Similar to Stochastic but more sensitive to recent price action.

📈 Parameters: Period = ${INDICATOR_PARAMS.WILLIAMS_R.period}`,

    "trading-type": `Trading Type Philosophy

🎯 Trading type is a FIRST-CLASS concept in codifx.
It fundamentally changes scanner behavior:

📊 SCALP (1m/5m):
  - Primary: 1m, Confirmation: 5m
  - Weights: 30% trend, 70% oscillator
  - Min score: 65
  - Focus: Quick reversals, high oscillator weight

📊 DAY (5m/15m):
  - Primary: 5m, Confirmation: 15m
  - Weights: 40% trend, 60% oscillator
  - Min score: 70
  - Focus: Intraday swings, balanced approach

📊 SWING (1h/1d):
  - Primary: 1h, Confirmation: 1d
  - Weights: 60% trend, 40% oscillator
  - Min score: 75
  - Focus: Multi-day trends, trend-heavy

⚠️ CRITICAL: Trading type is NOT just a label!
It changes timeframes, weights, and thresholds.`,

    "3-layer": `3-Layer Oscillator Logic (THE CORE RULE)

This is what makes codifx different from naive scanners.

🔹 Layer 1 - CONDITION (Zone Detection):
  Detects potential reversal zones
  Example: RSI < 30, Stochastic < 20
  ⚠️ NO SCORING YET - just zone detection

🔹 Layer 2 - TRIGGER (Event Detection):
  Detects price reaction to the zone
  Example: RSI crosses above 30, Stoch %K crosses %D
  ✓ ENTRY TIMING STARTS HERE

🔹 Layer 3 - CONFIRMATION (Validation):
  Validates signal quality
  Example: ADX > 20, bullish trend on higher TF
  ✓ SIGNAL IS INVALID WITHOUT THIS

⚠️ CRITICAL RULE:
At least 1 TRIGGER + 1 CONFIRMATION required for valid signal.

💡 Why this matters:
"Oversold is NOT an entry signal."
We need confirmation that price is actually reversing.`,
}

export async function explainCommand(options: { indicator?: string }) {
    if (!options.indicator) {
        console.log(Formatter.section("AVAILABLE EXPLANATIONS"))
        console.log("\nIndicators:")
        console.log("  • rsi")
        console.log("  • stochastic")
        console.log("  • macd")
        console.log("  • adx")
        console.log("  • momentum")
        console.log("  • cci")
        console.log("  • williams")
        console.log("\nConcepts:")
        console.log("  • trading-type")
        console.log("  • 3-layer")
        console.log("\nUsage: codifx explain --indicator <name>")
        return
    }

    const explanation = EXPLANATIONS[options.indicator.toLowerCase()]

    if (!explanation) {
        console.log(
            Formatter.error(
                `No explanation available for: ${options.indicator}`
            )
        )
        console.log('Run "codifx explain" to see available topics.')
        process.exit(1)
    }

    console.log(
        Formatter.section(`EXPLANATION: ${options.indicator.toUpperCase()}`)
    )
    console.log(explanation)
}
