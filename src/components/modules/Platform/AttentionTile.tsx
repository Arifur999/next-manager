import { companiesWithStanding } from "@/components/modules/Platform/companyLinks"
import { NOT_SET_UP } from "@/components/modules/Platform/subscriptionStatus"
import { Card } from "@/components/ui/card"
import type { IPlatformOverview } from "@/types/platform.types"
import Link from "next/link"

const FIGURE_LINK =
  "rounded-md outline-none hover:underline underline-offset-4 focus-visible:ring-[3px] focus-visible:ring-ring/50"

// Past due and suspended are counted apart because they are fixed in different ways.
// Never set up is the platform's own loose end, so it sits underneath rather than in the count.
const AttentionTile = ({ companies }: { companies: IPlatformOverview["companies"] }) => (
  <Card className="gap-0 p-5">
    <p className="text-sm text-muted-foreground">Needs attention</p>

    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
      <Link href={companiesWithStanding("past_due")} className={FIGURE_LINK}>
        <span className="block text-2xl font-semibold tracking-tight tabular-nums text-chart-2">
          {companies.past_due}
        </span>
        <span className="text-xs text-muted-foreground">past due</span>
      </Link>
      <Link href={companiesWithStanding("suspended")} className={FIGURE_LINK}>
        <span className="block text-2xl font-semibold tracking-tight tabular-nums text-chart-2">
          {companies.suspended}
        </span>
        <span className="text-xs text-muted-foreground">suspended</span>
      </Link>
    </div>

    <Link href={companiesWithStanding(NOT_SET_UP)} className={`mt-3 w-fit text-xs text-muted-foreground ${FIGURE_LINK}`}>
      {companies.unprovisioned} never set up on a plan
    </Link>
  </Card>
)

export default AttentionTile
