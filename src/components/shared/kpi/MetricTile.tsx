import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Attainment, Metric } from "@/types/kpi.types"
import { CircleHelp, TrendingDown, TrendingUp } from "lucide-react"

/**
 * One KPI, with the honesty the engine went to trouble to preserve.
 *
 * Three rules, all of them about not lying:
 *
 *   1. **A null metric shows its reason, not a zero.** The engine returns
 *      `{ value: null, reason }` precisely so a screen can say "no capacity
 *      recorded" instead of "0%". Rendering `?? 0` here would throw away the
 *      whole point of that.
 *   2. **`on_track: null` is grey, never red.** Unknown is not failing. A
 *      metric with no target set has not missed anything.
 *   3. **State is never colour alone.** Every on-track state carries an icon
 *      and a word, so it survives colourblindness, greyscale printing and
 *      forced-colors mode.
 */

type Tone = 1 | 2 | 3

const ACCENTS: Record<Tone, string> = {
    1: "text-chart-1",
    2: "text-chart-2",
    3: "text-chart-3",
}

type Props = {
    label: string
    metric: Attainment | Metric
    /** How to render the number once it exists. */
    format?: (value: number) => string
    /** Sits under the value — context, never a restatement of it. */
    hint?: string
    /** The decision-critical tile on a screen gets the bigger type. */
    size?: "default" | "lead"
    tone?: Tone
    /** True when the target is a ceiling, so "under" is the good direction. */
    lowerIsBetter?: boolean
}

const isAttainment = (metric: Attainment | Metric): metric is Attainment =>
    "on_track" in metric

const MetricTile = ({
    label,
    metric,
    format = (value) => value.toLocaleString(),
    hint,
    size = "default",
    tone = 1,
    lowerIsBetter = false,
}: Props) => {
    const attainment = isAttainment(metric) ? metric : null

    return (
        <Card className={cn("gap-0 p-5", size === "lead" && "sm:p-6")}>
            <p className="truncate text-sm text-muted-foreground">{label}</p>

            {metric.value === null ? (
                // The reason IS the content. A dash with no explanation sends
                // the reader looking for a bug that isn't there.
                <div className="mt-2 flex items-start gap-2">
                    <CircleHelp
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <p className="text-sm text-muted-foreground">
                        {metric.reason ?? "Not enough data yet"}
                    </p>
                </div>
            ) : (
                <>
                    <p
                        className={cn(
                            "mt-2 font-semibold tracking-tight tabular-nums",
                            size === "lead" ? "text-4xl" : "text-2xl",
                            ACCENTS[tone],
                        )}
                    >
                        {format(metric.value)}
                    </p>

                    {attainment && attainment.target !== null && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums">
                            {attainment.on_track === null ? (
                                <CircleHelp className="size-3.5" aria-hidden="true" />
                            ) : attainment.on_track ? (
                                <TrendingUp className="size-3.5" aria-hidden="true" />
                            ) : (
                                <TrendingDown className="size-3.5" aria-hidden="true" />
                            )}
                            <span>
                                {/* The word carries the state; the icon only
                                    repeats it. Colour is doing no work here. */}
                                {attainment.on_track === null
                                    ? "unknown"
                                    : attainment.on_track
                                      ? lowerIsBetter
                                          ? "within"
                                          : "on track"
                                      : lowerIsBetter
                                        ? "over"
                                        : "short"}{" "}
                                · target {format(attainment.target)}
                            </span>
                        </p>
                    )}

                    {attainment && attainment.target === null && (
                        <p className="mt-1.5 text-sm text-muted-foreground">
                            {/* Stated rather than left blank: a number with no
                                target is a fact nobody has judged yet, and
                                that is worth knowing. */}
                            No target set
                        </p>
                    )}
                </>
            )}

            {hint && <p className="mt-3 text-xs text-muted-foreground">{hint}</p>}
        </Card>
    )
}

export default MetricTile

/** Formatters shared across the dashboards, so a percentage reads the same everywhere. */
export const pct = (value: number) => `${value.toFixed(1)}%`
export const usd = (value: number) =>
    `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
export const usd2 = (value: number) =>
    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const bdt = (value: number) =>
    `৳${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
export const hours = (value: number) => `${value.toFixed(1)} h`
export const times = (value: number) => `${value.toFixed(1)}×`
export const days = (value: number) => `${Math.round(value)} d`
export const count = (value: number) => String(Math.round(value))
