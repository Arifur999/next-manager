"use client"

/**
 * A labelled bar whose width is a share of the largest row.
 *
 * Every row is direct-labelled with its figure, which is what the palette's
 * contrast relief requires — and with this few rows the labels do not become
 * the noise that labelling every point on a chart would.
 *
 * Pulled out of ReportBreakdowns when the reports split into five pages: three
 * of them draw this, and three copies would have drifted.
 */
const ShareRow = ({
  label,
  sub,
  value,
  share,
  negative,
}: {
  label: string
  sub?: string
  value: string
  share: number
  negative?: boolean
}) => (
  <li className="px-5 py-3">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm">{label}</p>
        {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
      <span className="shrink-0 text-sm font-medium tabular-nums">{value}</span>
    </div>

    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
      <div
        // Money leaving is a different STATE, not a different series, so it
        // takes the destructive status colour rather than another hue.
        className={`h-full rounded-full ${negative ? "bg-destructive" : "bg-chart-1"}`}
        style={{ width: `${Math.min(100, Math.max(0, share))}%` }}
      />
    </div>
  </li>
)

export default ShareRow
