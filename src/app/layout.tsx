import { site } from "@/data/site"
import AppToaster from "@/components/shared/AppToaster";
import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "./providers/ThemeProvider";
import { fontVariables } from "@/lib/fonts";
import { getSiteUrl } from "@/lib/siteUrl";
import { headers } from "next/headers";

// metadataBase comes from SITE_URL at request time, so one image serves any domain.
export const generateMetadata = (): Metadata => ({
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.name,
    description: site.description,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.description },
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Minted per request in the proxy and passed down on x-nonce. next-themes
  // puts an inline script in the head to paint the right theme before React
  // hydrates, and under a nonce CSP that is the one script a browser would
  // otherwise refuse - bringing back the white flash this whole mechanism
  // exists to avoid.
  //
  // The cost, stated rather than discovered later: reading headers() in the
  // ROOT layout makes every route dynamic. Static optimisation and ISR are
  // off, a CDN cannot cache a page, and Partial Prerendering does not apply.
  // The landing page and the four auth pages were prerendered at build and are
  // server-rendered on every request now.
  //
  // Worth it here because this app is almost entirely signed-in and dynamic
  // already - only five routes were static - and a nonce is what makes the CSP
  // mean anything. If that trade ever stops paying, the alternative is Next's
  // experimental SRI support, which needs no per-request value.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    // suppressHydrationWarning on BOTH elements, for two different reasons.
    //
    // <html>: next-themes writes the theme class here before React hydrates,
    // so the server's markup is expected to differ.
    //
    // <body>: extensions edit it. Grammarly, password managers and dark-mode
    // add-ons all attach their own attributes to <body> before React loads,
    // and React reports that as "attributes of the server rendered HTML didn't
    // match" - an error about the visitor's browser that reads like an error
    // about our code. Fifteen pages checked in a clean browser produce none of
    // these, so what it was reporting was never ours to fix.
    //
    // It suppresses the warning for THIS element's own attributes only - it
    // does not cascade - so a genuine mismatch anywhere inside still reports.
    <html lang="en" suppressHydrationWarning className={fontVariables}>
      <body
        suppressHydrationWarning
        className="antialiased font-sans"
      >
        {/* Baseline keyboard accessibility - the first tab stop on every page. */}
        <a
          href="#main-content"
          className="sr-only rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100"
        >
          Skip to main content
        </a>
        <ThemeProvider nonce={nonce}>
          {children}
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
