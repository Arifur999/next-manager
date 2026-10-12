import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// The KPI dashboards' first load, in their final shape: three metric tiles and
// the wide panel under them.
const KpiSkeleton = () => (
  <div aria-busy="true" aria-label="Loading" className="space-y-6">
    <div className="grid gap-4 lg:grid-cols-3">
      {[0, 1, 2].map((index) => (
        <Card key={index} className="gap-3 p-5">
          <Skeleton className="h-4 w-28 rounded-sm" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-3 w-40 rounded-sm" />
        </Card>
      ))}
    </div>
    <Skeleton className="h-48 w-full rounded-xl" />
  </div>
)

export default KpiSkeleton
