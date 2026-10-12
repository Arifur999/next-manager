"use client"

import RouteErrorState from "@/components/shared/state/RouteErrorState"

// Renders inside the dashboard layout, so the sidebar and navbar stay usable.
const DashboardError = ({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) => (
  <RouteErrorState digest={error.digest} retry={retry} />
)

export default DashboardError
