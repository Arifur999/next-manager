import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LinkIcon } from "lucide-react"
import Link from "next/link"

/**
 * A dead invite link is its own screen rather than a form that fails on submit.
 * Expired, already used, revoked and never-real all land here, because the
 * server does not tell them apart and neither should this.
 */
const InvalidInviteCard = () => (
  <div className="w-full">
    <Card>
      <CardHeader className="items-center text-center">
        <LinkIcon className="size-8 text-muted-foreground" aria-hidden="true" />
        <CardTitle>
          <h1 className="text-2xl font-semibold tracking-tight">This invite is no longer valid</h1>
        </CardTitle>
        <CardDescription>
          It may have expired, been used already, or been withdrawn. Ask whoever
          invited you for a fresh link.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button asChild variant="outline">
          <Link href="/login">Go to sign in</Link>
        </Button>
      </CardContent>
    </Card>
  </div>
)

export default InvalidInviteCard
