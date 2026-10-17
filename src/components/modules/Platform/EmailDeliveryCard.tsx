import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ISmtpStatus } from "@/types/platform.types"
import { CircleAlert, CircleCheck, Mail } from "lucide-react"
import Link from "next/link"

// Shown, not edited: mail credentials live in the server's environment, where they rotate without a database write.
const EmailDeliveryCard = ({ smtp }: { smtp: ISmtpStatus }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-base">
        <Mail className="size-4" aria-hidden="true" />
        Email delivery
      </CardTitle>
      <p className="text-sm text-muted-foreground">
        Set in the server&apos;s environment, so credentials never sit in the database.
      </p>
    </CardHeader>

    <CardContent className="space-y-3">
      <div className="flex items-center gap-2">
        {/* Icon and words together, never colour alone. */}
        {smtp.configured ? (
          <>
            <CircleCheck className="size-4 text-muted-foreground" aria-hidden="true" />
            <Badge variant="secondary">working</Badge>
          </>
        ) : (
          <>
            <CircleAlert className="size-4 text-muted-foreground" aria-hidden="true" />
            <Badge variant="destructive">not configured</Badge>
          </>
        )}
      </div>

      {smtp.configured ? (
        <dl className="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm">
          <dt className="text-muted-foreground">Server</dt>
          <dd className="truncate">
            {smtp.host}:{smtp.port}
          </dd>
          <dt className="text-muted-foreground">From</dt>
          <dd className="truncate">{smtp.from}</dd>
        </dl>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nothing is being emailed. Set <span className="font-mono text-xs">{smtp.missing.join(", ")}</span> in the
          server environment and restart it.
        </p>
      )}

      {/* Only once mail actually leaves: an unverified domain is the second problem, not the first. */}
      {smtp.configured && (
        <p className="rounded bg-muted/60 px-2.5 py-2 text-xs text-muted-foreground">
          Until the From domain is verified with your mail provider, mail only reaches your own address. Each{" "}
          <Link href="/platform/campaigns" className="text-primary underline-offset-4 hover:underline">
            campaign
          </Link>{" "}
          shows how many addresses it reached.
        </p>
      )}
    </CardContent>
  </Card>
)

export default EmailDeliveryCard
