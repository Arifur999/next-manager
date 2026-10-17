import AuthNoticeCard from "@/components/modules/Auth/AuthNoticeCard"
import { Button } from "@/components/ui/button"
import { LinkIcon } from "lucide-react"
import Link from "next/link"

/**
 * A dead invite link is its own screen rather than a form that fails on submit.
 * Expired, already used, revoked and never-real all land here, because the
 * server does not tell them apart and neither should this.
 */
const InvalidInviteCard = () => (
  <AuthNoticeCard
    icon={LinkIcon}
    title="This invite is no longer valid"
    description="It may have expired, been used already, or been withdrawn. Ask whoever invited you for a fresh link."
  >
    <div className="flex flex-wrap justify-center gap-3">
      <Button asChild variant="outline">
        <Link href="/login">Go to sign in</Link>
      </Button>
      <Button asChild variant="ghost">
        <Link href="/">Home</Link>
      </Button>
    </div>
  </AuthNoticeCard>
)

export default InvalidInviteCard
