import Wordmark from "@/components/modules/Home/Shell/Wordmark"
import { TRACE_STEPS } from "@/data/home/ledgerTrace"
import { site } from "@/data/site"
import Link from "next/link"
import type { ReactNode } from "react"

// Two columns from lg: the product and its one-line promise on an ink panel,
// the form on paper. One column below that, with the name above the form.
const AuthLayout = ({ children }: { children: ReactNode }) => (
  <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
    <aside className="hidden flex-col justify-between bg-band p-10 text-band-foreground lg:flex xl:p-14">
      <Wordmark inverse className="focus-visible:outline-band-foreground" />
      <div>
        <p className="max-w-[18ch] text-display">{site.tagline}</p>
        <ol className="mt-10 max-w-sm border-t border-band-foreground/25 text-sm">
          {TRACE_STEPS.map((step, index) => (
            <li key={step.id} className="flex items-baseline gap-4 border-b border-band-foreground/25 py-2.5">
              <span className="w-5 font-mono text-xs text-band-foreground/60 tabular-nums">{index + 1}</span>
              <span className="text-band-foreground/80">{step.module}</span>
              <span className="ml-auto">{step.title}</span>
            </li>
          ))}
        </ol>
      </div>
      <Link
        href="/"
        className="w-fit text-sm text-band-foreground/80 underline-offset-4 hover:text-band-foreground hover:underline focus-visible:outline-2 focus-visible:outline-band-foreground"
      >
        Back to the home page
      </Link>
    </aside>

    <main id="main-content" tabIndex={-1} className="flex flex-col bg-background focus:outline-none">
      <div className="flex items-center justify-between px-4 pt-6 sm:px-6 lg:hidden">
        <Wordmark />
        <Link href="/" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          Home
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </main>
  </div>
)

export default AuthLayout
