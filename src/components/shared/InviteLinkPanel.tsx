"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Copy, TriangleAlert } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import type { IInviteMail } from "@/types/common.types"

/**
 * The link from an invite just sent, shown once.
 *
 * Shown whether or not the email went out. Mail gets filtered, and an
 * unverified sending domain reaches nobody but your own address, so hiding the
 * link on a reported success strands you on a spam folder you cannot see.
 */
const InviteLinkPanel = ({
  link,
  mail,
  onDone,
}: {
  link: string
  mail: IInviteMail | null
  onDone: () => void
}) => {
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
    } catch {
      // Clipboard access can be refused; the link is on screen either way.
      toast.message("Copy it from the box above")
    }
  }

  return (
    <div className="border-t bg-muted/40 px-5 py-4">
      <p className="flex items-center gap-2 text-sm font-medium">
        {mail?.delivered ? (
          <>
            <Check className="size-4" aria-hidden="true" />
            Emailed to them
          </>
        ) : (
          <>
            <TriangleAlert className="size-4" aria-hidden="true" />
            Not emailed — send them this link yourself
          </>
        )}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {mail?.delivered
          ? "Keep a copy anyway, in case it lands in their spam. This is the only time it can be read — lose it and you revoke the invite and send another."
          : (mail?.reason ??
            "This is the only time the link can be read. Lose it and you revoke the invite and send another.")}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Input readOnly value={link} className="min-w-64 flex-1 font-mono text-xs" />
        <Button type="button" variant="outline" onClick={() => void copyLink()}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  )
}

export default InviteLinkPanel
