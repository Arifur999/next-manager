import { MODULE_FACTS, MODULES } from "@/data/home/modules"
import { Fragment } from "react"
import SectionShell from "../Shell/SectionShell"
import ModuleCount from "./ModuleCount"

const joinFacts = (index: number, total: number) => {
  if (index === total - 1) return ""
  if (index === total - 2) return " and "
  return ", "
}

// Breadth in one sentence with its counts inline, not a row of big stat cards.
const ModuleBand = () => (
  <SectionShell labelledBy="modules-title" variant="dense" className="border-b">
    <h2 id="modules-title" className="max-w-4xl text-title font-normal text-muted-foreground">
      {MODULE_FACTS.map((fact, index) => (
        <Fragment key={fact.label}>
          <ModuleCount value={fact.value} /> {fact.label}
          {joinFacts(index, MODULE_FACTS.length)}
        </Fragment>
      ))}
      , in one workspace.
    </h2>
    <ul aria-label="Modules" className="mt-8 flex flex-wrap gap-x-2 gap-y-2">
      {MODULES.map((module) => (
        <li key={module} className="rounded-md border bg-card px-3 py-1.5 text-sm">
          {module}
        </li>
      ))}
    </ul>
  </SectionShell>
)

export default ModuleBand
