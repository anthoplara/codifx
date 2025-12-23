/**
 * Configuration schema validation using Zod
 */

import { z } from "zod"

const TradingTypeSchema = z.enum(["scalp", "day", "swing"])

const TimeframeSchema = z.enum(["1m", "5m", "15m", "1h", "1d"])

const TimeframesSchema = z.object({
    primary: TimeframeSchema,
    confirmation: TimeframeSchema,
})

const IndicatorsSchema = z.object({
    trend: z.array(z.string()),
    oscillators: z.array(z.string()),
})

const WeightsSchema = z
    .object({
        trend: z.number().min(0).max(100),
        oscillator: z.number().min(0).max(100),
    })
    .refine((data) => data.trend + data.oscillator === 100, {
        message: "Trend and oscillator weights must sum to 100",
    })

const FiltersSchema = z.object({
    minVolume: z.number().positive(),
    minADX: z.number().min(0).max(100),
    atrMin: z.number().positive().optional(),
    atrMax: z.number().positive().optional(),
})

const ScoringSchema = z.object({
    minScore: z.number().min(0).max(100),
})

const DataSourceSchema = z
    .object({
        provider: z.string(),
        apiKey: z.string().optional(),
        market: z.enum(["IDX", "NASDAQ", "NYSE", "CRYPTO"]).optional(),
        defaultSymbols: z.array(z.string()).optional(),
    })
    .optional()

export const ProfileSchema = z.object({
    tradingType: TradingTypeSchema,
    timeframes: TimeframesSchema,
    indicators: IndicatorsSchema,
    weights: WeightsSchema,
    filters: FiltersSchema,
    scoring: ScoringSchema,
    dataSource: DataSourceSchema,
})

export type ProfileSchemaType = z.infer<typeof ProfileSchema>
