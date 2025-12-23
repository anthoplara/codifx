# CODIFX - Professional Trading Scanner CLI

[![npm version](https://img.shields.io/npm/v/codifx.svg)](https://www.npmjs.com/package/codifx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Professional multi-type trading scanner CLI with advanced technical analysis,
risk management, and HTML dashboard visualization.

## 🎯 Features

### Multi-Type Trading Support

-   **Scalping** (1m/5m) - Fast-paced, oscillator-heavy analysis
-   **Day Trading** (5m/15m) - Balanced trend and oscillator signals
-   **Swing Trading** (1h/1d) - Trend-focused, high-quality signals

### Advanced Analysis

-   ✅ **Multi-Timeframe Confirmation** - Primary + confirmation timeframe
    analysis
-   ✅ **8 Technical Indicators** - RSI, MACD, Stochastic, ADX, CCI, Williams
    %R, EMAs, SMAs
-   ✅ **Smart Filters** - Volume, volatility (ATR %), and minimum ADX filters
-   ✅ **Trading Levels** - Automatic entry, stop-loss, take-profit, support,
    and resistance
-   ✅ **Risk Management** - Risk/Reward ratio and win rate estimation

### Visual Dashboard

-   🎨 **HTML Dashboard** - Beautiful, responsive interface with TradingView
    charts
-   📊 **Interactive Filters** - Filter signals by direction (BUY/SELL) and
    strength
-   🤖 **AI Analysis Modal** - Detailed breakdown of each signal
-   📈 **Real-time Charts** - Integrated TradingView widget for instant chart
    viewing

## 📦 Installation

```bash
npm install -g codifx
```

## 🚀 Quick Start

### Basic Scan

```bash
# Scan with default profile (day trading)
codifx scan --symbols BBCA TLKM ASII

# Scan specific market
codifx scan --symbols AAPL TSLA MSFT --market NASDAQ

# Scan with direction filter
codifx scan --symbols BBCA TLKM --direction buy

# Generate HTML dashboard
codifx scan --symbols BBCA TLKM --html

# Save detailed log
codifx scan --symbols BBCA TLKM --log
```

### Custom Profiles & Watchlists

Create custom trading strategies with your own profiles and symbol lists.

#### Creating a Custom Profile

Create a JSON file (e.g., `my-strategy.profile.json`):

```json
{
    "tradingType": "day",
    "timeframes": {
        "primary": "5m",
        "confirmation": "15m"
    },
    "indicators": {
        "trend": ["EMA10", "EMA20", "EMA50"],
        "oscillators": ["RSI", "Stochastic", "MACD", "ADX"]
    },
    "weights": {
        "trend": 40,
        "oscillator": 60
    },
    "filters": {
        "minVolume": 1000000,
        "minADX": 20,
        "atrMinPercent": 1.0,
        "atrMaxPercent": 4.0
    },
    "scoring": {
        "minScore": 70
    },
    "dataSource": {
        "market": "IDX",
        "provider": "yahoo"
    }
}
```

**Key Parameters:**

-   `weights.trend` / `weights.oscillator` - Must total 100
-   `scoring.minScore` - Higher = more selective (60-80 recommended)
-   `filters.minVolume` - Daily volume threshold
-   `filters.minADX` - Trend strength (15-25 typical)

#### Creating a Custom Watchlist

**Simple Array Format:**

```json
["BBCA", "TLKM", "ASII", "UNVR", "ICBP"]
```

**Object Format with Metadata:**

```json
{
    "name": "Banking Sector",
    "market": "IDX",
    "symbols": ["BBCA", "BBNI", "BBRI", "BMRI", "BDMN", "BNGA"]
}
```

**Multi-Market Format:**

```json
[
    {
        "name": "IDX Blue Chips",
        "market": "IDX",
        "symbols": ["BBCA", "TLKM", "ASII", "UNVR"]
    },
    {
        "name": "US Tech",
        "market": "NASDAQ",
        "symbols": ["AAPL", "MSFT", "GOOGL", "NVDA"]
    }
]
```

#### Usage Examples

```bash
# Use custom profile only
codifx scan --profile aggressive-day.json --symbols BBCA TLKM

# Use custom watchlist only
codifx scan --watchlist banking-sector.json --html

# Combine custom profile + watchlist
codifx scan \
  --profile scalp.json \
  --watchlist high-volume.json \
  --date 2025-12-22 \
  --html

# Built-in trade type + custom watchlist
codifx scan --trade-type swing --watchlist my-stocks.json

# All options combined
codifx scan \
  --profile my-strategy.json \
  --watchlist tech-stocks.json \
  --direction buy \
  --date 2025-12-20 \
  --html \
  --log
```

**Symbol Priority:** `--symbol` > `--symbols` > `--watchlist` > profile default

### Historical Backtesting

Test your strategy with historical data (max 7 days back):

```bash
# Scan as of specific date
codifx scan --symbols BBCA TLKM --date 2025-12-22

# Backtest with HTML dashboard
codifx scan --symbols BBCA --date 2025-12-20 --html --log

# Compare historical vs current
codifx scan --symbols BBCA --date 2025-12-20 --log
codifx scan --symbols BBCA --log  # Today's scan
```

**Date Format**: `YYYY-MM-DD` (e.g., `2025-12-22`)  
**Limitation**: Maximum 7 days back, cannot be in the future

### Profile Management

```bash
# List all profiles
codifx profile --list

# Show profile details
codifx profile --show day

# Set active profile
codifx profile --use swing

# Validate profile
codifx profile --validate scalp
```

## 📊 Trading Profiles

### 🔥 Scalp Profile

```json
{
    "tradingType": "scalp",
    "timeframes": { "primary": "1m", "confirmation": "5m" },
    "weights": { "trend": 30, "oscillator": 70 },
    "filters": {
        "minVolume": 2000000,
        "minADX": 20,
        "atrMinPercent": 0.8,
        "atrMaxPercent": 4.0
    },
    "scoring": { "minScore": 65 }
}
```

**Characteristics:**

-   ⚡ Ultra-fast timeframes (1m/5m)
-   📊 Oscillator-focused (70% weight)
-   💰 Highest volume requirement (2M)
-   🎯 Lowest score threshold (65) - more signals

---

### 📈 Day Profile

```json
{
    "tradingType": "day",
    "timeframes": { "primary": "5m", "confirmation": "15m" },
    "weights": { "trend": 40, "oscillator": 60 },
    "filters": {
        "minVolume": 1000000,
        "minADX": 20,
        "atrMinPercent": 0.5,
        "atrMaxPercent": 3.0
    },
    "scoring": { "minScore": 70 }
}
```

**Characteristics:**

-   ⚖️ Balanced timeframes (5m/15m)
-   🔄 Balanced weights (40/60)
-   💼 Medium volume requirement (1M)
-   🎯 Medium score threshold (70)

---

### 🌊 Swing Profile

```json
{
    "tradingType": "swing",
    "timeframes": { "primary": "1h", "confirmation": "1d" },
    "weights": { "trend": 60, "oscillator": 40 },
    "filters": {
        "minVolume": 500000,
        "minADX": 25,
        "atrMinPercent": 0.3,
        "atrMaxPercent": 2.5
    },
    "scoring": { "minScore": 75 }
}
```

**Characteristics:**

-   📅 Longer timeframes (1h/1d)
-   📈 Trend-focused (60% weight)
-   💵 Lower volume requirement (500K)
-   🎯 Highest score threshold (75) - quality over quantity

## 🎨 HTML Dashboard Features

### Interactive Interface

-   **Stats Bar** - Total signals, buy/sell split, average score
-   **Filter Buttons** - All, Buy Only, Sell Only, Strong Signals (≥80)
-   **Signal Cards** - Color-coded with gradient backgrounds
-   **Smooth Animations** - Fade-in effects for better UX

### Signal Cards Display

Each card shows:

-   **Symbol** - Stock ticker (e.g., IDX:BBCA)
-   **Direction** - BUY ▲ or SELL ▼
-   **Score** - Final score out of 100
-   **Rating** - STRONG BUY, BUY, or SPECULATIVE
-   **Breakdown** - Trend and Oscillator scores with progress bars
-   **Bonuses** - Volume, Volatility, and Confirmation bonuses

### Chart & AI Analysis

-   **📊 Chart Button** - Opens TradingView chart in modal
-   **🤖 AI Button** - Shows detailed analysis:
    -   Technical Summary
    -   Trend Analysis
    -   Oscillator Signals
    -   Trading Levels (Entry, SL, TP, Support, Resistance)
    -   Filter Status
    -   Recommendation

## 📋 Output Example

### Console Output

```
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
                                              TRADING SIGNALS FOUND
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
SYMBOL     DIR      SCORE   RATING        ENTRY       SUPPORT     RESIST      SL          TP          RR      WIN%
──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
BBCA.JK    ▲ BUY    86      STRONG BUY    Rp 8.025    Rp 8.000    Rp 8.075    Rp 7.990    Rp 8.105    2.0     79%
TLKM.JK    ▼ SELL   74      SPECULATIVE   Rp 3.470    Rp 3.430    Rp 3.470    Rp 3.485    Rp 3.425    2.0     70%
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════

✨ Total signals: 2
```

### Log Output (with --log)

```
[BBCA.JK] ✔ SIGNAL FOUND
  Direction: BUY ▲
  Rating: STRONG BUY
  Final Score: 86/100

  Score Breakdown:
    - Trend: 85/100
    - Oscillator: 90/100
    - Volume Bonus: +5
    - Volatility Bonus: +4
    - Confirmation Bonus: +7

  Trading Levels:
    - Entry: Rp 8,025
    - Stop Loss: Rp 7,990
    - Take Profit: Rp 8,105
    - Support: Rp 8,000
    - Resistance: Rp 8,075
    - Risk/Reward: 1:2.0
    - Win Rate: 79%

  Filters:
    - Liquidity: PASS ✅
    - Volatility: PASS ✅
```

## 🎯 Scoring System

### Base Score Calculation

```
Final Score = (Trend × Weight_Trend) + (Oscillator × Weight_Oscillator) + Bonuses
```

### Bonuses

-   **Volume Bonus** (0-10): Based on volume spike vs average
-   **Volatility Bonus** (0-8): Based on ATR% within optimal range
-   **Confirmation Bonus** (5-10): Multi-timeframe alignment

### Rating Assignment

-   **STRONG BUY/SELL**: Score ≥ 85
-   **BUY/SELL**: Score ≥ 75
-   **SPECULATIVE**: Score ≥ 65 (or profile minScore)

## Advanced Usage

### Custom Scan with All Options

```bash
codifx scan \
  --symbols BBCA TLKM ASII UNVR \
  --market IDX \
  --direction both \
  --html \
  --log ~/trading/logs/scan.log
```

### Batch Scanning

```bash
# Create symbols file
echo "BBCA\nTLKM\nASII\nUNVR" > stocks.txt

# Scan all symbols
codifx scan --symbols $(cat stocks.txt) --html
```

### Profile Switching Workflow

```bash
# Morning scalping
codifx profile --use scalp
codifx scan --symbols BBCA TLKM --html

# Midday swing trading
codifx profile --use swing
codifx scan --symbols BBCA TLKM ASII --html
```

## 🌍 Supported Markets

-   **IDX** - Indonesia Stock Exchange
-   **NASDAQ** - NASDAQ Stock Market
-   **NYSE** - New York Stock Exchange
-   **CRYPTO** - Cryptocurrency markets

Symbol format:

-   IDX: `BBCA`, `TLKM` (auto-adds `.JK`)
-   US: `AAPL`, `TSLA`, `MSFT`
-   Crypto: `BTC-USD`, `ETH-USD`

## 🔍 Troubleshooting

### No Signals Found

-   **Too strict filters**: Lower `minScore` or adjust ATR% range
-   **Low volume stocks**: Reduce `minVolume` requirement
-   **Wrong timeframe**: Try different profile (scalp/day/swing)

### HTML Not Opening

-   Check browser settings
-   File location: `/tmp/codifx-dashboard.html` (macOS/Linux)
-   Manually open the file from temp directory

### Data Fetch Issues

-   Check internet connection
-   Verify symbol format
-   Yahoo Finance API may have rate limits

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**anthoplara** <anthoplara@gmail.com>

## 🔗 Links

-   GitHub: https://github.com/anthoplara/codifx
-   NPM: https://www.npmjs.com/package/codifx
-   Issues: https://github.com/anthoplara/codifx/issues

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!
