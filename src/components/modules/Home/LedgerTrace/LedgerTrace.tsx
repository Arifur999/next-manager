import { LEDGER_TRACE_INTRO, TRACE_STEPS } from "@/data/home/ledgerTrace"
import { cn } from "@/lib/utils"
import { MarkerNotes } from "../Frame/MarkerNote"
import SectionShell from "../Shell/SectionShell"
import TraceFrame from "./TraceFrame"

const NOTES = [
  "The total is the accepted milestone plus the approved hours. Nothing is typed twice.",
  "The rate is saved with the exchange, so the dollar and the taka figures both stay true.",
]

// The signature: one job crossing five modules, joined by a ruled line. A
// native scroll-snap rail on small screens, a ruled five-column grid on large.
const LedgerTrace = () => (
  <SectionShell id="product" labelledBy="trace-title" className="border-b">
    <div className="grid gap-6 lg:grid-cols-12">
      <h2 id="trace-title" className="text-display lg:col-span-6">
        {LEDGER_TRACE_INTRO.title}
      </h2>
      <p className="max-w-[52ch] text-lg text-muted-foreground lg:col-span-5 lg:col-start-8 lg:self-end">
        {LEDGER_TRACE_INTRO.body}
      </p>
    </div>

    <div
      role="region"
      aria-label="The job, step by step"
      tabIndex={0}
      className="relative -mx-4 mt-12 overflow-x-auto px-4 pb-4 [scrollbar-width:thin] focus-visible:outline-2 focus-visible:outline-ring sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0"
    >
      <ol className="flex snap-x snap-mandatory gap-4 lg:grid lg:snap-none lg:grid-cols-5">
        {TRACE_STEPS.map((step, index) => {
          const isLast = index === TRACE_STEPS.length - 1
          return (
            <li key={step.id} className="w-[78%] shrink-0 snap-start sm:w-[44%] lg:w-auto">
              <div className="flex items-center" aria-hidden="true">
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-foreground bg-background text-[0.6875rem] font-semibold tabular-nums">
                  {index + 1}
                </span>
                <span className={cn("h-px flex-1 bg-foreground/70", isLast ? "bg-transparent" : "-mr-4")} />
              </div>
              <h3 className="mt-4 text-title">
                <span className="sr-only">Step {index + 1}, {step.module}: </span>
                {step.title}
              </h3>
              <div className="mt-4">
                <TraceFrame id={step.id} module={step.module} />
              </div>
              <p className="mt-4 text-sm">{step.caption}</p>
            </li>
          )
        })}
      </ol>
    </div>

    <MarkerNotes className="mt-10 max-w-2xl" notes={NOTES} />
  </SectionShell>
)

export default LedgerTrace
