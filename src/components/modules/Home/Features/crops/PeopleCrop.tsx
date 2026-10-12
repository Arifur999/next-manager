import { formatBdt } from "@/lib/currency"
import FrameChrome from "../../Frame/FrameChrome"

const ROWS = [
  { person: "Tanvir Ahmed", department: "Design", net: 85000 },
  { person: "Nusrat Jahan Chowdhury", department: "Development", net: 92000 },
  { person: "Rafiq Hasan", department: "Operations", net: 48000 },
]

const total = ROWS.reduce((sum, row) => sum + row.net, 0)

const PeopleCrop = () => (
  <FrameChrome title="Payroll / October run" label="A payroll run in BDT that posts payouts to the ledger, sample data">
    <table className="w-full table-fixed text-sm">
      <caption className="sr-only">October payroll, net pay in BDT</caption>
      <thead>
        <tr className="border-b text-left text-xs text-muted-foreground">
          <th scope="col" className="px-4 py-2 font-normal">Person</th>
          <th scope="col" className="w-28 px-2 py-2 font-normal">Department</th>
          <th scope="col" className="w-32 px-4 py-2 text-right font-normal">Net, BDT</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {ROWS.map((row) => (
          <tr key={row.person}>
            <td className="truncate px-4 py-2.5" title={row.person}>{row.person}</td>
            <td className="truncate px-2 py-2.5 text-muted-foreground">{row.department}</td>
            <td className="px-4 py-2.5 text-right font-mono tabular-nums">{formatBdt(row.net).replace("BDT", "").trim()}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t font-medium">
          <td className="px-4 py-2.5" colSpan={2}>
            Completed, posted as team payouts
          </td>
          <td className="px-4 py-2.5 text-right font-mono tabular-nums">{formatBdt(total).replace("BDT", "").trim()}</td>
        </tr>
      </tfoot>
    </table>
  </FrameChrome>
)

export default PeopleCrop
