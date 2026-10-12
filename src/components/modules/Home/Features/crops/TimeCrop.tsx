import FrameChrome from "../../Frame/FrameChrome"

const ROWS = [
  { person: "Tanvir Ahmed", project: "Riverside site rebuild", hours: 12.5 },
  { person: "Maria Okafor", project: "Greenline Logistics portal", hours: 9 },
  { person: "Nusrat Jahan Chowdhury", project: "Riverside site rebuild", hours: 6.25 },
  { person: "Leo Brennan", project: "Harbour Physio Clinic audit", hours: 3.5 },
]

const TimeCrop = () => (
  <FrameChrome title="Time approvals" label="An approval queue of logged hours, sample data">
    <ul className="divide-y text-sm">
      {ROWS.map((row) => (
        <li key={row.person} className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{row.person}</p>
            <p className="truncate text-xs text-muted-foreground">{row.project}</p>
          </div>
          <p className="shrink-0 font-mono text-sm tabular-nums">{row.hours.toFixed(2)} h</p>
          <span aria-hidden="true" className="shrink-0 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
            Approve
          </span>
        </li>
      ))}
    </ul>
    <p className="border-t px-4 py-2.5 text-xs text-muted-foreground">31.25 hours waiting from 4 people</p>
  </FrameChrome>
)

export default TimeCrop
