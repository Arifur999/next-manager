"use client"

import RouteErrorState from "@/components/shared/state/RouteErrorState"

const RootError = ({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) => (
  <main id="main-content" tabIndex={-1} className="flex min-h-screen items-center justify-center">
    <RouteErrorState digest={error.digest} retry={retry} />
  </main>
)

export default RootError
