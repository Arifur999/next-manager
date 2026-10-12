import NotFoundState from "@/components/shared/state/NotFoundState"

const RootNotFound = () => (
  <main id="main-content" tabIndex={-1} className="flex min-h-screen items-center justify-center">
    <NotFoundState homeHref="/" homeLabel="Go to the home page" />
  </main>
)

export default RootNotFound
