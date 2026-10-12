import { PROBLEM } from "@/data/home/problem"
import SectionShell from "../Shell/SectionShell"

// The status quo in the buyer's own words, then what it costs. Dense and plain:
// no icons, no cards.
const Problem = () => (
  <SectionShell labelledBy="problem-title" variant="dense" className="border-b bg-muted/50">
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <h2 id="problem-title" className="text-heading">
          {PROBLEM.title}
        </h2>
        <div className="mt-6 space-y-4 text-base text-muted-foreground">
          {PROBLEM.statusQuo.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
      <dl className="divide-y border-y lg:col-span-6 lg:col-start-7">
        {PROBLEM.costs.map((cost) => (
          <div key={cost.name} className="grid gap-1 py-5 sm:grid-cols-[12rem_1fr] sm:gap-6">
            <dt className="font-medium">{cost.name}</dt>
            <dd className="text-muted-foreground">{cost.detail}</dd>
          </div>
        ))}
      </dl>
    </div>
  </SectionShell>
)

export default Problem
