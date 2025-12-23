# CODIFX - Professional Trading Scanner CLI

[![npm version](https://badge.fury.io/js/codifx.svg)](https://www.npmjs.com/package/codifx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**CODIFX** is a professional-grade command-line trading scanner that analyzes
technical indicators across multiple timeframes to identify high-probability
trading opportunities. Supports scalping, day trading, and swing trading
strategies.

## ✨ Features

### 🎯 Multi-Strategy Support

-   **Scalping** (1m/5m timeframes)
-   **Day Trading** (5m/15m timeframes)
-   **Swing Trading** (1h/1d timeframes)

### 📊 Comprehensive Technical Analysis

-   **Trend Detection**: EMA/SMA alignment, slope analysis
-   **Oscillators**: RSI, Stochastic, MACD, ADX, CCI
-   **Volume Analysis**: Volume spike detection
-   **Volatility**: ATR-based volatility bonuses

### 🎯 Complete Trading Levels

-   **Entry Price**: Current market price
-   **Support & Resistance**: Automatic pivot detection
-   **Stop Loss**: ATR-based (2×ATR)
-   **Take Profit**: Risk-reward optimized (1:2 ratio)
-   **Win Rate**: Estimated based on signal strength

### 🔍 Smart Filtering

-   **Liquidity Filter**: Minimum volume requirements
-   **Volatility Filter**: ATR percentage-based (fair across all price ranges)
-   **Score Threshold**: Configurable minimum scores
-   **Direction Filter**: Filter by BUY/SELL signals

### 📝 Professional Logging

-   Detailed signal analysis
-   Comprehensive NO SIGNAL diagnostics
-   Rejection statistics breakdown
-   Export to log files

## 📦 Installation

```bash
npm install -g codifx
```

## 🚀 Quick Start

### Basic Scan

```bash
# Scan IDX stocks (default market)
codifx scan --symbols BBCA.JK BBRI.JK TLKM.JK

# Scan US stocks
codifx scan --symbols AAPL MSFT GOOGL --market NASDAQ
```

### Filter by Direction

```bash
# Only BUY signals
codifx scan --symbols BBCA.JK BBRI.JK --direction buy

# Only SELL signals
codifx scan --symbols AAPL MSFT --direction sell
```

### Save to Log File

```bash
codifx scan --symbols BBCA.JK BBRI.JK --log my-scan.log
```

### Use Different Trading Profiles

```bash
# Scalping (quick trades, 1m/5m timeframes)
codifx scan --symbols AAPL --profile profiles/scalp.profile.json

# Swing trading (longer holds, 1h/1d timeframes)
codifx scan --symbols AAPL --profile profiles/swing.profile.json
```

## 📊 Sample Output

```
════════════════════════════════════════════════════════════════════════════════
                        🎯  TRADING SIGNALS FOUND
════════════════════════════════════════════════════════════════════════════════
SYMBOL     DIR    SCORE   RATING        ENTRY       SUPPORT     RESIST      SL          TP          RR    WIN%
────────────────────────────────────────────────────────────────────────────────
BBRI.JK    ▼SELL  71      SPECULATIVE   Rp 3,750    Rp 3,680    Rp 3,820    Rp 3,820    Rp 3,610    2.0   68%
BBCA.JK    ▲BUY   82      STRONG_BUY    Rp 10,250   Rp 10,100   Rp 10,400   Rp 10,100   Rp 10,550   2.0   78%
════════════════════════════════════════════════════════════════════════════════
```

### Column Descriptions

-   **DIR**: Signal direction (▲BUY / ▼SELL)
-   **SCORE**: Signal strength (0-100)
-   **RATING**: Trading recommendation
-   **ENTRY**: Recommended entry price
-   **SUPPORT**: Nearest support level
-   **RESIST**: Nearest resistance level
-   **SL**: Stop Loss price (risk management)
-   **TP**: Take Profit target (reward)
-   **RR**: Risk-Reward ratio
-   **WIN%**: Estimated win rate

## 🎛️ Commands

### `scan` - Scan Live Market Data

Analyze stocks for trading opportunities.

```bash
codifx scan [options]

Options:
  -s, --symbol <symbol>        Single symbol to scan
  -l, --symbols <symbols...>   Multiple symbols to scan
  -m, --market <market>        Market: IDX, NASDAQ, NYSE, CRYPTO (default: IDX)
  -d, --direction <direction>  Filter by signal direction: buy, sell, or both (default: both)
  --log [filepath]             Save detailed scan log to file
  -h, --help                   Display help
```

### `simulate` - Backtest with Simulated Data

Test strategies with generated data.

```bash
codifx simulate
```

### `profile` - Manage Trading Profiles

List and view trading profiles.

```bash
codifx profile --list
codifx profile --show day
```

### `validate` - Validate Configuration

Validate profile configuration files.

```bash
codifx validate --profile profiles/day.profile.json
```

## ⚙️ Configuration

### Trading Profiles

CODIFX includes 3 pre-configured profiles:

#### Day Trading (default)

-   Primary: 5m, Confirmation: 15m
-   Volatility: 0.5-3.0% ATR
-   Min Score: 70

#### Scalping

-   Primary: 1m, Confirmation: 5m
-   Volatility: 0.8-4.0% ATR (higher tolerance)
-   Min Score: 65

#### Swing Trading

-   Primary: 1h, Confirmation: 1d
-   Volatility: 0.3-2.5% ATR (lower tolerance)
-   Min Score: 75

### Custom Profiles

Create custom profiles in JSON format:

```json
{
    "tradingType": "custom",
    "timeframes": {
        "primary": "15m",
        "confirmation": "1h"
    },
    "filters": {
        "minVolume": 1000000,
        "atrMinPercent": 0.5,
        "atrMaxPercent": 3.0
    },
    "scoring": {
        "minScore": 70
    }
}
```

## 🎯 Use Cases

### For Day Traders

```bash
# Scan Indonesian blue chips for day trading
codifx scan --symbols BBCA.JK BBRI.JK BMRI.JK TLKM.JK ASII.JK

# Only look for BUY opportunities
codifx scan --symbols BBCA.JK BBRI.JK --direction buy --log trades.log
```

### For Scalpers

```bash
# Quick scalping opportunities
codifx scan --symbols AAPL TSLA --profile profiles/scalp.profile.json --direction buy
```

### For Swing Traders

```bash
# Longer-term setups
codifx scan --symbols GOOGL AMZN MSFT --profile profiles/swing.profile.json
```

## 📈 Trading Signals Explained

### Signal Ratings

-   **STRONG_BUY** (85-100): High confidence long entry
-   **BUY** (70-84): Good long entry
-   **SPECULATIVE** (60-69): Lower confidence, higher risk
-   **HOLD** (40-59): No clear direction
-   **SELL/STRONG_SELL**: Short opportunities

### Win Rate Estimation

Based on signal strength and confirmations:

-   High quality signals (80+): ~75-85% win rate
-   Medium signals (70-79): ~65-75% win rate
-   Speculative (60-69): ~55-65% win rate

### Risk Management

All signals include:

-   **Stop Loss**: Placed at 2×ATR from entry
-   **Take Profit**: 1:2 risk-reward ratio
-   **Support/Resistance**: Market structure context

## 🔧 API & Programmatic Use

```typescript
import { ScannerEngine, loadProfile } from "codifx"

const profile = await loadProfile("profiles/day.profile.json")
const analysis = await ScannerEngine.analyze(
    symbol,
    primaryData,
    confirmationData,
    profile
)

if (analysis.signal) {
    console.log("Signal found!", analysis.signal)
}
```

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/yourusername/codifx.git
cd codifx

# Install dependencies
npm install

# Build
npm run build

# Run locally
npm start

# Development mode (watch)
npm run dev
```

## 📝 Requirements

-   **Node.js**: >= 18.0.0
-   **Internet**: Required for live market data

## 🗺️ Roadmap

-   [ ] Real-time WebSocket streaming
-   [ ] Telegram/Discord notifications
-   [ ] Backtesting with historical data
-   [ ] Web dashboard
-   [ ] Portfolio tracking
-   [ ] More markets (crypto, forex, commodities)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## ⚠️ Disclaimer

**CODIFX is for educational and informational purposes only.**

-   This software does NOT provide financial advice
-   Past performance does not guarantee future results
-   Trading involves substantial risk of loss
-   Always do your own research (DYOR)
-   Never risk more than you can afford to lose
-   Consult with a licensed financial advisor before trading

The authors and contributors are not responsible for any financial losses
incurred through the use of this software.

## 📞 Support

-   **Issues**: [GitHub Issues](https://github.com/yourusername/codifx/issues)
-   **Email**: your.email@example.com
-   **Documentation**: [Wiki](https://github.com/yourusername/codifx/wiki)

## ⭐ Show Your Support

If you find CODIFX useful, please consider giving it a star on GitHub!

---

**Made with ❤️ for traders by traders**
