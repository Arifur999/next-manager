// The product's name, pitch and navigation, in one place for metadata and copy.
// Client components import this file too, so it must stay free of server-only
// imports; the absolute site URL comes from getSiteUrl() in src/lib/siteUrl.ts.
export const site = {
  name: "Naxified Management",
  shortName: "Naxified",
  description:
    "Naxified Management runs a client-service business in one workspace: leads and clients, projects and tasks, timesheets, invoices and payments, expenses, payroll and reports.",
  tagline: "Client work and the money behind it, in one ledger.",
  // TODO(owner): the legal entity that publishes the site. Empty means no
  // Organization JSON-LD is emitted.
  publisher: "",
} as const

export interface INavLink {
  label: string
  href: string
}

export const MARKETING_NAV: INavLink[] = [
  { label: "Product", href: "/#product" },
  { label: "Workflow", href: "/#workflow" },
  { label: "Roles", href: "/#roles" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
]

export const SIGN_IN = { label: "Sign in", href: "/login" } as const
export const REGISTER_HREF = "/register"

/**
 * The one label for every primary call to action on the page. A trial is
 * promised only when the public plans endpoint reports one longer than 0 days.
 */
export const getPrimaryCta = (trialDays: number | null | undefined) => ({
  label: trialDays && trialDays > 0 ? "Start your free trial" : "Create your workspace",
  href: REGISTER_HREF,
})

/** The line under a primary CTA that removes the last hesitation. */
export const getCtaMicrocopy = (trialDays: number | null | undefined) =>
  trialDays && trialDays > 0
    ? `${trialDays}-day free trial. No card needed to sign up.`
    : "Set up your workspace in a few minutes."
