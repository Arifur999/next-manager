"use client"

import { toSafeExternalUrl } from "@/lib/safeUrl"
import { revealCredentialAction } from "@/app/(dashboardLayout)/admin/dashboard/vault/_action"
import AccessLogDialog from "@/components/modules/Admin/Vault/AccessLogDialog"
import CredentialActions from "@/components/modules/Admin/Vault/CredentialActions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { ICredential } from "@/types/workspace.types"
import { Check, Copy, ExternalLink, Eye, EyeOff } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

/**
 * One credential.
 *
 * The password is a mask until somebody presses Reveal, which is a real request
 * that the server logs. It is never fetched as part of the list, so simply
 * opening this page leaves no trace against anyone's name — only deliberately
 * looking does.
 *
 * A revealed value is held in local state only, and cleared when the card is
 * hidden again or after a couple of minutes, so a screen left open does not
 * quietly keep showing a secret.
 */
const AUTO_HIDE_MS = 2 * 60 * 1000

type CredentialCardProps = {
  credential: ICredential
  canEdit: boolean
  canDelete: boolean
  /** The access log is admin-only at the API. */
  canSeeLog: boolean
}

const CredentialCard = ({ credential, canEdit, canDelete, canSeeLog }: CredentialCardProps) => {
  const [revealed, setRevealed] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { run: reveal, isPending: isRevealing } = useActionMutation({
    action: revealCredentialAction,
    // The password appearing is the confirmation.
    successMessage: false,
    refresh: false,
    onSuccess: (result) => {
      if (result.success) setRevealed(result.data.password)
    },
  })

  // A secret left on screen indefinitely is the thing this vault exists to
  // avoid, so it hides itself again.
  useEffect(() => {
    if (!revealed) return
    const timer = setTimeout(() => setRevealed(null), AUTO_HIDE_MS)
    return () => clearTimeout(timer)
  }, [revealed])

  const handleReveal = async () => {
    if (revealed) {
      setRevealed(null)
      return
    }

    await reveal(credential.id)
  }

  const handleCopy = async () => {
    if (!revealed) return

    try {
      await navigator.clipboard.writeText(revealed)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access needs a secure context and can be refused outright;
      // the password is on screen either way, so this is not worth an error.
      toast.message("Copy was blocked — select the password and copy it manually.")
    }
  }

  const safeUrl = toSafeExternalUrl(credential.url)

  return (
    <Card className="gap-0 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{credential.label}</p>
          <p className="truncate text-xs text-muted-foreground">
            {credential.client?.name ?? credential.project?.name ?? "Agency-internal"}
          </p>
          {credential.url && !safeUrl && (
            <p className="truncate text-xs text-muted-foreground">{credential.url}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center">
          {safeUrl && (
            <Button asChild variant="ghost" size="icon" className="shrink-0">
              <a href={safeUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                <span className="sr-only">Open {credential.label}</span>
              </a>
            </Button>
          )}
          <CredentialActions credential={credential} canEdit={canEdit} canDelete={canDelete} />
        </div>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <dt className="w-20 shrink-0 text-xs text-muted-foreground">Username</dt>
          <dd className="truncate font-mono text-xs">{credential.username || "—"}</dd>
        </div>

        <div className="flex items-center gap-2">
          <dt className="w-20 shrink-0 text-xs text-muted-foreground">Password</dt>
          <dd className="min-w-0 flex-1 truncate font-mono text-xs">
            {revealed ?? credential.password}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handleReveal()}
          disabled={isRevealing}
        >
          {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          {revealed ? "Hide" : isRevealing ? "Revealing..." : "Reveal"}
        </Button>

        {revealed && (
          <Button type="button" variant="outline" size="sm" onClick={() => void handleCopy()}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        )}

        {canSeeLog && <AccessLogDialog credential={credential} />}
      </div>

      {revealed && (
        <p className="mt-3 text-xs text-muted-foreground">
          This reveal was recorded. Hiding again in two minutes.
        </p>
      )}
    </Card>
  )
}

export default CredentialCard
