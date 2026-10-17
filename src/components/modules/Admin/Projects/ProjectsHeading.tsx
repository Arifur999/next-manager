"use client"

import PageHeader from "@/components/shared/PageHeader"
import { useSearchParams } from "next/navigation"

// The title is the page, the same word as the sidebar; the view is the tab
// below. Reads the view from the URL rather than from the page: the table
// filters in place, without a server render, and the description follows.
const ProjectsHeading = () => {
  const params = useSearchParams()
  const status = params.get("status")
  const isMine = params.get("mine") === "true"

  const describe = () => {
    if (isMine) return "Projects you are on the team for."
    if (status) return `Projects sitting at ${status}.`
    return "Work for clients. Payments, expenses and payouts can all be tied to one."
  }

  return <PageHeader title="Projects">{describe()}</PageHeader>
}

export default ProjectsHeading
