import { Card } from "@/components/ui/card"
import { formatDay } from "@/lib/dates"
import type { IProject } from "@/types/project.types"

const Missing = ({ children }: { children: string }) => <span className="text-muted-foreground">{children}</span>

// What the project is, what the team should know, and when it runs.
const ProjectOverview = ({ project }: { project: IProject }) => (
  <Card className="p-5">
    <dl className="grid gap-4 sm:grid-cols-2">
      <div>
        <dt className="text-xs text-muted-foreground">Description</dt>
        <dd className="mt-1 text-sm whitespace-pre-wrap">
          {project.description || <Missing>Not written yet.</Missing>}
        </dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">Notes</dt>
        <dd className="mt-1 text-sm whitespace-pre-wrap">{project.notes || <Missing>No notes.</Missing>}</dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">Timeline</dt>
        <dd className="mt-1 text-sm">
          {project.start_date ? formatDay(project.start_date) : "Start not set"}
          {" → "}
          {project.end_date ? formatDay(project.end_date) : "open-ended"}
        </dd>
      </div>
    </dl>
  </Card>
)

export default ProjectOverview
