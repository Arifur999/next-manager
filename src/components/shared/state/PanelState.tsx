import type { ReactNode } from "react"
import ErrorState from "./ErrorState"
import ListSkeleton from "./ListSkeleton"

interface IPanelStateProps {
  query: { isError: boolean; isLoading: boolean; isFetching: boolean; refetch: () => unknown }
  errorMessage: string
  isEmpty: boolean
  empty: ReactNode
  children: ReactNode
}

// The four states of a dashboard list panel, in the order they win: failed,
// first load, empty, rows. Keeps "no rows" from ever standing in for "no answer".
const PanelState = ({ query, errorMessage, isEmpty, empty, children }: IPanelStateProps) => {
  if (query.isError) {
    return <ErrorState message={errorMessage} onRetry={() => void query.refetch()} isRetrying={query.isFetching} />
  }
  if (query.isLoading) return <ListSkeleton />
  if (isEmpty) return empty
  return children
}

export default PanelState
