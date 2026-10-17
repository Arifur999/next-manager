import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

/**
 * A screen on the auth pages that says something instead of asking for
 * something: a dead link, a sent email, an account waiting for approval.
 * Everything is centred, the icon included (CardHeader is a grid, so that takes
 * justify-items rather than items-center).
 */
const AuthNoticeCard = ({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon
  title: ReactNode
  description: ReactNode
  /** Actions or a short note under the description. */
  children?: ReactNode
}) => (
  <div className="w-full">
    <Card>
      <CardHeader className="justify-items-center text-center">
        <Icon className="size-8 text-muted-foreground" aria-hidden="true" />
        <CardTitle>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children && (
        <CardContent className="flex flex-col items-center gap-3 text-center text-sm text-muted-foreground">
          {children}
        </CardContent>
      )}
    </Card>
  </div>
)

export default AuthNoticeCard
