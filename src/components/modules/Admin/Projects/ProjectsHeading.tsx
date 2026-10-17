"use client"

import { useSearchParams } from "next/navigation"

// Reads the view from the URL rather than from the page: the table filters in
// place, without a server render, and the heading has to follow.
const ProjectsHeading = () => {
  const params = useSearchParams()
  const status = params.get("status")
  const isMine = params.get("mine") === "true"

  const description = isMine
    ? "Projects you are on the team for."
    : status
      ? `Projects sitting at ${status}.`
      : "Work for clients. Payments, expenses and payouts can all be tied to one."

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{isMine ? "My projects" : (status ?? "Projects")}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export default ProjectsHeading
