import { REGISTER_HREF, SIGN_IN, site, type INavLink } from "@/data/site"
import Link from "next/link"
import Wordmark from "./Wordmark"

// TODO(owner): Privacy and Terms pages. Linked here once they exist.
const FooterColumn = ({ title, links }: { title: string; links: INavLink[] }) => (
  <div>
    <h2 className="text-sm font-medium">{title}</h2>
    <ul className="mt-3 space-y-2">
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
)

const MarketingFooter = ({ links }: { links: INavLink[] }) => (
  <footer className="border-t">
    <div className="mx-auto grid w-full max-w-content gap-10 px-4 py-12 sm:px-6 md:grid-cols-12 lg:px-8">
      <div className="md:col-span-6">
        <Wordmark />
        <p className="mt-4 max-w-sm text-sm text-muted-foreground">{site.tagline}</p>
      </div>
      <div className="grid grid-cols-2 gap-8 md:col-span-6">
        <FooterColumn title="Product" links={links} />
        <FooterColumn
          title="Account"
          links={[
            { label: SIGN_IN.label, href: SIGN_IN.href },
            { label: "Create a workspace", href: REGISTER_HREF },
            { label: "Reset your password", href: "/forgot-password" },
          ]}
        />
      </div>
    </div>
    <div className="mx-auto w-full max-w-content border-t px-4 py-6 text-xs text-muted-foreground sm:px-6 lg:px-8">
      <p>{site.name}</p>
    </div>
  </footer>
)

export default MarketingFooter
