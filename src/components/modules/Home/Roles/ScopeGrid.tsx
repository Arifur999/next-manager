import { ROLE_COLUMNS, SCOPE_GRID, SCOPE_OVERRIDE_EXAMPLE } from "@/data/home/roles"
import { cn } from "@/lib/utils"
import { SCOPE_INFO, type PermissionScope } from "@/types/permission.types"

const TONE: Record<PermissionScope, string> = {
  all: "text-foreground",
  assigned: "text-foreground",
  own: "text-foreground",
  none: "text-muted-foreground",
}

// Read-only, like the permission grid in the app, with the defaults a new
// workspace starts from.
const ScopeGrid = () => (
  <div className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-frame">
    <div role="region" aria-label="Scope grid, scrolls sideways" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
      <table className="w-full min-w-[34rem] text-sm font-condensed">
        <caption className="border-b bg-muted/60 px-4 py-2.5 text-left text-xs font-medium">
          Who sees how much: the default view scope per role
        </caption>
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th scope="col" className="px-4 py-2 font-normal">Module</th>
            {ROLE_COLUMNS.map((column) => (
              <th key={column.role} scope="col" className="px-3 py-2 font-normal">
                {column.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {SCOPE_GRID.map((row) => (
            <tr key={row.module}>
              <th scope="row" className="px-4 py-2.5 text-left font-medium">
                {row.module}
              </th>
              {ROLE_COLUMNS.map((column) => {
                const scope = row.scopes[column.role]
                return (
                  <td key={column.role} className={cn("px-3 py-2.5", TONE[scope])}>
                    {SCOPE_INFO[scope].label}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t px-4 py-3 text-xs">
      <span className="rounded-[2px] bg-marker px-1 font-medium text-marker-foreground">
        {SCOPE_OVERRIDE_EXAMPLE.person}, {SCOPE_OVERRIDE_EXAMPLE.role}: {SCOPE_OVERRIDE_EXAMPLE.module} set to{" "}
        {SCOPE_INFO[SCOPE_OVERRIDE_EXAMPLE.scope].label}
      </span>
      <span className="text-muted-foreground">{SCOPE_OVERRIDE_EXAMPLE.note}</span>
    </p>
  </div>
)

export default ScopeGrid
