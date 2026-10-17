import { NOT_SET_UP_LABEL, STATUS_LABEL, STATUS_TONE } from "@/components/modules/Platform/subscriptionStatus"
import { Badge } from "@/components/ui/badge"
import type { SubscriptionStatus } from "@/types/platform.types"

// A company's standing as a badge; no subscription row reads "Not set up".
const StandingBadge = ({ status }: { status: SubscriptionStatus | undefined }) => {
  if (!status) return <Badge variant="outline">{NOT_SET_UP_LABEL}</Badge>
  return <Badge variant={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
}

export default StandingBadge
