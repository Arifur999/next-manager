import { Button } from "@/components/ui/button"
import Link from "next/link"

const NotFoundState = ({ homeHref, homeLabel }: { homeHref: string; homeLabel: string }) => (
  <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-16 text-center">
    <p className="font-mono text-sm text-muted-foreground">404</p>
    <h1 className="text-xl font-semibold">Page not found</h1>
    <p className="text-sm text-muted-foreground">The page you asked for does not exist or has moved.</p>
    <Button asChild>
      <Link href={homeHref}>{homeLabel}</Link>
    </Button>
  </div>
)

export default NotFoundState
