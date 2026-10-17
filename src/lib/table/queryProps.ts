import type { PaginationMeta } from "@/types/api.types"

interface ListQueryState {
  data?: { meta?: PaginationMeta }
  isPending: boolean
  isFetching: boolean
  isError: boolean
  refetch: () => unknown
}

// Spreads a list useQuery result onto DataTable: <DataTable {...toTableQueryProps(query)} />.
// The skeleton follows isPending (nothing cached yet) rather than isLoading:
// it is the same on the server and in the first client render, so hydration agrees.
export const toTableQueryProps = (query: ListQueryState) => ({
  meta: query.data?.meta,
  isLoading: query.isPending,
  isFetching: query.isFetching,
  isError: query.isError,
  onRetry: () => void query.refetch(),
})
