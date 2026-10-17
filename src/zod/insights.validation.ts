import { z } from "zod"
import { KPI_METRICS, KPI_PERIODS } from "@/types/insights.types"
import { isoDate } from "./formFields"

// What the "Applies to" picker holds for a target that belongs to the whole
// agency; a Select item cannot have an empty value.
export const AGENCY_WIDE_TARGET = "__agency__"

export const kpiTargetFormZodSchema = z.object({
    metric: z.enum(KPI_METRICS),
    period: z.enum(KPI_PERIODS),
    owner: z.string().min(1),
    // A target of zero is meaningful for metrics where the goal is none. The
    // API refuses a percentage above 100 and names the metric when it does.
    target_value: z
        .string()
        .trim()
        .min(1, "Enter a target")
        .refine((value) => Number.isFinite(Number(value)), "The target must be a number")
        .refine((value) => Number(value) >= 0, "Target cannot be negative"),
})

export type IKpiTargetFormValues = z.infer<typeof kpiTargetFormZodSchema>

// period_start comes from the browser, where the user's calendar decides
// which month or quarter "this" one is; the server's clock may be a day off.
export const setKpiTargetServerZodSchema = kpiTargetFormZodSchema
    .extend({ period_start: isoDate })
    .transform((values) => ({
        metric: values.metric,
        period: values.period,
        period_start: values.period_start,
        target_value: Number(values.target_value),
        user_id: values.owner === AGENCY_WIDE_TARGET ? null : values.owner,
    }))
