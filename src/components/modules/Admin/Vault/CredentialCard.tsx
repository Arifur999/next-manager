"use client"

import {
  getAccessLogAction,
  revealCredentialAction,
} from "@/app/(dashboardLayout)/admin/dashboard/vault/_action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ICredential, ICredentialAccessEntry } from "@/types/agencio.types"
import { useMutation } from "@tanstack/react-query"
import { format } from "date-fns"
import { Check, Copy, ExternalLink, Eye, EyeOff, History, User } from "lucide-react"
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

const ACTION_LABEL: Record<string, string> = {
  created: "added it",
  updated: "changed it",
  viewed: "opened it",
  revealed: "revealed the password",
  deleted: "deleted it",
}

const CredentialCard = ({ credential }: { credential: ICredential }) => {
  const [revealed, setRevealed] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [log, setLog] = useState<ICredentialAccessEntry[]>([])

  const { mutateAsync: reveal, isPending: isRevealing } = useMutation({
    mutationFn: () => revealCredentialAction(credential.id),
  })

  const { mutateAsync: loadLog, isPending: isLoadingLog } = useMutation({
    mutationFn: () => getAccessLogAction(credential.id),
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

    const result = await reveal()

    if (!result.success) {
      toast.error(result.message || "Failed to reveal credential")
      return
    }

    setRevealed("data" in result ? result.data.password : null)
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

  const handleOpenLog = async () => {
    setLogOpen(true)
    const result = await loadLog()
    if (result.success && "data" in result) {
      setLog(result.data)
    }
  }

  return (
    <>
      <Card className="gap-0 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-medium">{credential.label}</p>
            <p className="truncate text-xs text-muted-foreground">
              {credential.client?.name ?? credential.project?.name ?? "Agency-internal"}
            </p>
          </div>

          {credential.url && (
            <Button asChild variant="ghost" size="icon" className="shrink-0">
              <a href={credential.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                <span className="sr-only">Open {credential.label}</span>
              </a>
            </Button>
          )}
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

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => void handleOpenLog()}
          >
            <History className="size-3.5" />
            Access log
          </Button>
        </div>

        {revealed && (
          <p className="mt-3 text-xs text-muted-foreground">
            This reveal was recorded. Hiding again in two minutes.
          </p>
        )}
      </Card>

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="max-h-[80vh] overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-5 pr-14">
            <DialogTitle>Access log</DialogTitle>
            <DialogDescription>
              Who has touched {credential.label}, newest first. Append-only — nobody can edit this.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[calc(80vh-6rem)] overflow-y-auto">
            {isLoadingLog ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">Loading...</p>
            ) : log.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">Nothing yet.</p>
            ) : (
              <ul className="divide-y">
                {log.map((entry) => (
                  <li key={entry.id} className="flex items-start gap-3 px-6 py-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{entry.user?.full_name ?? "Someone"}</span>{" "}
                        {ACTION_LABEL[entry.action] ?? entry.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.created_at), "MMM dd, yyyy 'at' HH:mm")}
                        {entry.ip ? ` · ${entry.ip}` : ""}
                      </p>
                    </div>
                    {entry.action === "revealed" && (
                      <Badge variant="outline" className="ml-auto shrink-0 text-xs">
                        revealed
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CredentialCard
