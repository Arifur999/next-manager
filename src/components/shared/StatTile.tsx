import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatTileProps = {
  label: string;
  value: string;
  /** A second figure under the main one — never a converted version of it. */
  secondary?: string;
  hint?: string;
  /**
   * The icon element itself rather than a name to look up. Nav config has to be
   * serializable and so goes through iconMapper, but nothing here crosses that
   * boundary — and resolving a name to a component during render is the pattern
   * React Compiler flags.
   */
  icon?: React.ReactNode;
  /** Which of the five chart hues to tint the icon chip with. */
  tone?: 1 | 2 | 3 | 4 | 5;
  className?: string;
};

// Written out rather than built by interpolation: Tailwind only ships classes
// it can see as complete strings in the source.
const TONES: Record<NonNullable<StatTileProps["tone"]>, string> = {
  1: "bg-chart-1/12 text-chart-1",
  2: "bg-chart-2/12 text-chart-2",
  3: "bg-chart-3/12 text-chart-3",
  4: "bg-chart-4/12 text-chart-4",
  5: "bg-chart-5/12 text-chart-5",
};

const StatTile = ({ label, value, secondary, hint, icon, tone = 1, className }: StatTileProps) => {
  return (
    <Card className={cn("gap-0 p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          {/* tabular-nums so figures line up column to column instead of
              jittering as digits change width. */}
          <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
          {secondary && (
            <p className="mt-1 text-sm text-muted-foreground tabular-nums">{secondary}</p>
          )}
        </div>

        {icon && (
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              TONES[tone],
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>

      {hint && <p className="mt-3 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
};

export default StatTile;
