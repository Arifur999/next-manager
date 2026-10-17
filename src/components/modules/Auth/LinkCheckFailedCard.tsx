import AuthNoticeCard from "@/components/modules/Auth/AuthNoticeCard"
import RetryPageButton from "@/components/modules/Auth/RetryPageButton"
import { Button } from "@/components/ui/button"
import { CloudOff } from "lucide-react"
import Link from "next/link"

/**
 * The API did not answer while checking an emailed link. Said as exactly that,
 * never as "this link is dead": the link may be fine, and somebody told it is
 * dead asks for a new one they did not need.
 */
const LinkCheckFailedCard = ({ subject }: { subject: "invite" | "link" }) => (
  <AuthNoticeCard
    icon={CloudOff}
    title={`We could not check this ${subject}`}
    description={`The check did not go through, so your ${subject} may still be fine. Try again in a moment.`}
  >
    <div className="flex flex-wrap justify-center gap-3">
      <RetryPageButton />
      <Button asChild variant="ghost">
        <Link href="/">Home</Link>
      </Button>
    </div>
  </AuthNoticeCard>
)

export default LinkCheckFailedCard
