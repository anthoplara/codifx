# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-23

### Added

-   Initial release
-   Multi-strategy support (scalping, day trading, swing trading)
-   Comprehensive technical analysis (trend, oscillators, volume, volatility)
-   Complete trading levels (Entry, Support, Resistance, SL, TP)
-   Risk management features (Win Rate estimation, Risk-Reward ratio)
-   Smart filtering (liquidity, volatility ATR%, direction)
-   Professional logging and scan summaries
-   Visual progress bar for scans
-   Direction filter (--direction buy/sell/both)
-   Support for multiple markets (IDX, NASDAQ, NYSE, CRYPTO)
-   3 pre-configured trading profiles (day, scalp, swing)
-   Detailed NO SIGNAL diagnostics
-   Rejection statistics breakdown

### Features

-   ATR percentage-based volatility filter (fair across all price ranges)
-   Support/Resistance calculation from pivot points
-   Stop Loss calculation (2×ATR-based)
-   Take Profit calculation (1:2 risk-reward)
-   Win Rate estimation (40-95% based on signal quality)
-   Export scan results to log files
-   Configurable score thresholds
-   Multi-timeframe confirmation

[0.1.0]: https://github.com/yourusername/codifx/releases/tag/v0.1.0
