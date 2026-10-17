import type { UserRole } from "@/lib/authUtils"
import { ROLE_LABELS } from "@/zod/user.validation"

export interface IProfileCopy {
  pageIntro: string
  detailsIntro: string
  roleLabel: string
  roleReason: string
}

// The same page serves company users and the platform team, who belong to no
// company: copy about "the agency" and "an admin" would point them at people
// who do not exist.
export const getProfileCopy = (role: UserRole): IProfileCopy => {
  if (role === "super_admin") {
    return {
      pageIntro: "How you appear to the rest of the platform team.",
      detailsIntro: "Your name is what other operators see in the activity log and on the team list.",
      roleLabel: "Platform operator",
      roleReason: "What you can do in the console is set under Permissions.",
    }
  }

  return {
    pageIntro: "What the rest of the agency sees when your name appears on their screen.",
    detailsIntro: "Your name is what colleagues see on approvals, timesheets and assignments.",
    roleLabel: ROLE_LABELS[role],
    roleReason: "What you can reach. Only an admin can change it.",
  }
}

// Nobody can change a sign-in address from the app, an admin included, so the
// reason says that rather than sending somebody to ask for it.
export const EMAIL_REASON = "You sign in with this address, so it cannot be changed here."
