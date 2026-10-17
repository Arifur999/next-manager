import AuthNoticeCard from "@/components/modules/Auth/AuthNoticeCard"
import { Button } from "@/components/ui/button"
import { LinkIcon } from "lucide-react"
import Link from "next/link"

const COPY = {
  incomplete: {
    title: "This link is incomplete",
    description:
      "It is missing the part that identifies your request, usually because a mail client broke the link across two lines. Ask for a fresh one.",
  },
  // Spent and unknown links land here too: the server does not tell them apart.
  expired: {
    title: "This link has expired",
    description: "Reset links work once and only for 30 minutes. Ask for a new one and use the latest email.",
  },
} as const

// A reset link that cannot be used, said before anybody types a new password
// twice. The button only opens the form that asks for a link; it sends nothing.
const ResetLinkCard = ({ reason }: { reason: keyof typeof COPY }) => (
  <AuthNoticeCard icon={LinkIcon} title={COPY[reason].title} description={COPY[reason].description}>
    <Button asChild>
      <Link href="/forgot-password">Send a new link</Link>
    </Button>
  </AuthNoticeCard>
)

export default ResetLinkCard
