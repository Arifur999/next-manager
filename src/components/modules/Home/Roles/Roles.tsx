import { ROLE_COLUMNS, ROLES_INTRO, SECURITY_POINTS } from "@/data/home/roles"
import { FadeIn } from "@/components/motion/FadeIn"
import SectionShell from "../Shell/SectionShell"
import ScopeGrid from "./ScopeGrid"

const Roles = () => (
  <SectionShell id="roles" labelledBy="roles-title" className="border-b">
    <div className="grid gap-6 lg:grid-cols-12">
      <h2 id="roles-title" className="text-display lg:col-span-6">
        {ROLES_INTRO.title}
      </h2>
      <p className="max-w-[52ch] text-lg text-muted-foreground lg:col-span-5 lg:col-start-8 lg:self-end">{ROLES_INTRO.body}</p>
    </div>

    <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
      {ROLE_COLUMNS.map((column) => (
        <li key={column.role} className="bg-background p-5">
          <h3 className="text-title">{column.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{column.summary}</p>
          <p className="mt-5 text-xs font-medium text-muted-foreground">Opens</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {column.opens.map((item) => (
              <li key={item.route}>{item.label}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>

    <div className="mt-12 grid gap-10 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-7">
        <FadeIn>
          <ScopeGrid />
        </FadeIn>
      </div>
      <div className="lg:col-span-4 lg:col-start-9">
        <h3 className="text-title">Kept safe, and on the record</h3>
        <dl className="mt-4 divide-y border-y">
          {SECURITY_POINTS.map((point) => (
            <div key={point.title} className="py-4">
              <dt className="font-medium">{point.title}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{point.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </SectionShell>
)

export default Roles
