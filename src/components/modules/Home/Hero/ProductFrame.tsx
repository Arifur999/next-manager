import { DEMO_INVOICES, DEMO_KPIS, DEMO_WORKSPACE } from "@/data/home/productDemo"
import { HERO } from "@/data/home/hero"
import { formatBdt, formatUsd } from "@/lib/currency"
import DemoStatus from "../Frame/DemoStatus"
import FrameChrome from "../Frame/FrameChrome"
import { Marked } from "../Frame/MarkerNote"

const Tile = ({ label, children, hint }: { label: string; children: React.ReactNode; hint: string }) => (
  <div className="min-w-0 px-3 py-3 sm:px-4">
    <p className="truncate text-xs text-muted-foreground" title={label}>{label}</p>
    <p className="mt-1 text-sm font-semibold tracking-tight tabular-nums sm:text-lg">{children}</p>
    <p className="mt-0.5 hidden truncate text-xs text-muted-foreground sm:block">{hint}</p>
  </div>
)

// A dashboard slice built from the app's real tokens. Server markup only: it is
// the first thing next to the headline, so it never animates in.
const ProductFrame = () => (
  <FrameChrome title={`${DEMO_WORKSPACE} / Dashboard`} label={HERO.frameLabel}>
    <div className="grid grid-cols-3 divide-x">
      <Tile label="Unpaid, USD" hint={`${DEMO_KPIS.unpaidCount} invoices, ${DEMO_KPIS.overdueCount} overdue`}>
        {formatUsd(DEMO_KPIS.unpaidUsd)}
      </Tile>
      <Tile label="Bank, BDT" hint={`${DEMO_KPIS.bdtAccountName} today`}>
        <Marked n={1}>{formatBdt(DEMO_KPIS.bdtBalance, { compact: true })}</Marked>
      </Tile>
      <Tile label="To approve" hint={`Hours from ${DEMO_KPIS.hoursPeople} people`}>
        <Marked n={2}>{DEMO_KPIS.hoursAwaiting}</Marked>
      </Tile>
    </div>

    <div className="border-t">
      <p className="px-4 pt-3 text-xs font-medium">Invoices</p>
      <table className="mt-1 w-full table-fixed text-sm">
        <caption className="sr-only">Recent invoices in the sample workspace</caption>
        <colgroup>
          <col />
          <col className="w-24" />
          <col className="w-28" />
        </colgroup>
        <thead className="sr-only">
          <tr>
            <th scope="col">Invoice</th>
            <th scope="col">Status</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {DEMO_INVOICES.map((invoice) => (
            <tr key={invoice.number}>
              <td className="px-4 py-2.5">
                <p className="truncate" title={invoice.client}>
                  {invoice.client}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {invoice.number}
                  <span className="ml-2 font-sans whitespace-nowrap">Due {invoice.due}</span>
                </p>
              </td>
              <td className="px-2 py-2.5 whitespace-nowrap">
                <DemoStatus status={invoice.status} />
              </td>
              <td className="px-4 py-2.5 text-right font-mono whitespace-nowrap tabular-nums">{formatUsd(invoice.amountUsd)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </FrameChrome>
)

export default ProductFrame
