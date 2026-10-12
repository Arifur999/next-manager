import { WORKFLOW, WORKFLOW_STEPS } from "@/data/home/workflow"
import { SplitReveal } from "@/components/motion/SplitReveal"
import SectionShell from "../Shell/SectionShell"

// Ruled like a ledger page: one row per step, the step's own record on the right.
const Workflow = () => (
  <SectionShell id="workflow" labelledBy="workflow-title" className="border-b">
    <div className="grid gap-6 lg:grid-cols-12">
      <SplitReveal className="lg:col-span-7">
        <h2 id="workflow-title" className="text-display [text-wrap:wrap]">
          {WORKFLOW.title}
        </h2>
      </SplitReveal>
      <p className="max-w-[48ch] text-lg text-muted-foreground lg:col-span-4 lg:col-start-9 lg:self-end">{WORKFLOW.intro}</p>
    </div>

    <ol className="mt-12 border-t border-foreground">
      {WORKFLOW_STEPS.map((step, index) => (
        <li key={step.title} className="grid gap-4 border-b py-6 md:grid-cols-12 md:gap-6">
          <p aria-hidden="true" className="font-mono text-sm text-muted-foreground tabular-nums md:col-span-1">
            {String(index + 1).padStart(2, "0")}
          </p>
          <div className="md:col-span-5">
            <h3 className="text-title">{step.title}</h3>
            <p className="mt-1 text-sm font-medium text-primary-strong">{step.role}</p>
            <p className="mt-3 max-w-[52ch] text-muted-foreground">{step.body}</p>
          </div>
          <div className="min-w-0 md:col-span-6 md:self-center">
            <p className="sr-only">Record left by this step:</p>
            <ul className="flex flex-wrap overflow-hidden rounded-md border bg-card text-xs shadow-frame font-condensed">
              {step.row.map((cell, cellIndex) => (
                <li
                  key={cell}
                  className={
                    cellIndex === 0
                      ? "border-r bg-muted/60 px-3 py-2 font-medium"
                      : "border-r px-3 py-2 tabular-nums last:border-r-0"
                  }
                >
                  {cell}
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  </SectionShell>
)

export default Workflow
