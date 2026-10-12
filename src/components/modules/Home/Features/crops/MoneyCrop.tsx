import { formatUsd } from "@/lib/currency"
import FrameChrome from "../../Frame/FrameChrome"

// Monthly profit in USD, sample data. Bars start at zero; the latest month is
// labelled directly so colour never carries the meaning alone.
const MONTHS = [
  { month: "May", profit: 6200 },
  { month: "Jun", profit: 4100 },
  { month: "Jul", profit: 7800 },
  { month: "Aug", profit: 5600 },
  { month: "Sep", profit: 9100 },
  { month: "Oct", profit: 8400 },
]

const max = Math.max(...MONTHS.map((m) => m.profit))

const MoneyCrop = () => (
  <FrameChrome title="Reports / Profit and loss" label="Monthly profit in USD for six months, sample data">
    <div className="px-4 pt-3 text-xs">
      <p className="font-medium">Profit by month, USD</p>
      <p className="text-muted-foreground">Income minus expenses, payouts and payroll</p>
    </div>
    <div className="grid h-44 grid-cols-6 items-end gap-3 px-4 pt-4 pb-2" role="img" aria-label="Profit rose from 6,200 dollars in May to 8,400 in October, with a high of 9,100 in September">
      {MONTHS.map((m, index) => (
        <div key={m.month} className="flex h-full flex-col justify-end">
          {index === MONTHS.length - 1 && (
            <p className="mb-1 text-center text-[0.6875rem] font-medium tabular-nums">{formatUsd(m.profit, { compact: true })}</p>
          )}
          <div className="rounded-t-[3px] bg-chart-1" style={{ height: `${(m.profit / max) * 100}%` }} />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-6 gap-3 border-t px-4 py-2 text-center text-[0.6875rem] text-muted-foreground">
      {MONTHS.map((m) => (
        <span key={m.month}>{m.month}</span>
      ))}
    </div>
  </FrameChrome>
)

export default MoneyCrop
