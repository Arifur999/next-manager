import { Skeleton } from "@/components/ui/skeleton"

// Rows in the shape of the list that is coming, so nothing jumps when it lands.
const ListSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <ul aria-busy="true" aria-label="Loading" className="divide-y">
    {Array.from({ length: rows }, (_, index) => (
      <li key={index} className="flex items-center justify-between gap-3 px-5 py-3">
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-2/5 rounded-sm" />
          <Skeleton className="h-3 w-1/4 rounded-sm" />
        </div>
        <Skeleton className="h-4 w-16 rounded-sm" />
      </li>
    ))}
  </ul>
)

export default ListSkeleton
