import TaskCard from "@/components/modules/Admin/Tasks/TaskCard"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { ITask, IWorkflowStatus } from "@/types/work.types"

const TaskColumns = ({ tasks, statuses }: { tasks: ITask[]; statuses: IWorkflowStatus[] }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {statuses.map((column) => {
      const columnTasks = tasks.filter((task) => task.status.id === column.id)

      return (
        <Card key={column.id} className="gap-0 overflow-hidden p-0">
          <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
            <CardTitle className="text-sm">
              {column.name}
              {!column.is_active && (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">(off)</span>
              )}
            </CardTitle>
            <span className="text-xs text-muted-foreground tabular-nums">{columnTasks.length}</span>
          </CardHeader>

          <div className="space-y-2 p-3">
            {columnTasks.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">Empty</p>
            ) : (
              columnTasks.map((task) => <TaskCard key={task.id} task={task} statuses={statuses} />)
            )}
          </div>
        </Card>
      )
    })}
  </div>
)

export default TaskColumns
