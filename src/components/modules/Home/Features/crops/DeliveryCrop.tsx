import FrameChrome from "../../Frame/FrameChrome"

const COLUMNS = [
  { name: "To do", tasks: ["Write the services page copy", "Collect clinic photos"] },
  { name: "In progress", tasks: ["Booking form with insurance fields"] },
  { name: "In review", tasks: ["Home page layout, desktop and mobile"] },
  { name: "Done", tasks: ["Sitemap agreed", "Brand colours confirmed"] },
]

const DeliveryCrop = () => (
  <FrameChrome title="Riverside site rebuild / Tasks" label="A task board with four custom workflow columns, sample data">
    <div className="border-b px-4 py-2.5 text-xs">
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="font-medium">Next milestone: Design</span>
        <span className="text-muted-foreground">Submitted, waiting for the client</span>
      </p>
    </div>
    <div className="overflow-x-auto">
      <div className="grid min-w-[36rem] grid-cols-4 gap-3 p-3 text-xs">
        {COLUMNS.map((column) => (
          <div key={column.name} className="min-w-0 rounded-md bg-muted/60 p-2">
            <p className="px-1 font-medium">{column.name}</p>
            <ul className="mt-2 space-y-1.5">
              {column.tasks.map((task) => (
                <li key={task} className="rounded-sm border bg-card px-2 py-2">
                  {task}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </FrameChrome>
)

export default DeliveryCrop
