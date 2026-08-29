import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Roboto_Condensed } from "next/font/google";
import "./globals.css";
import QueryProviders from "./providers/QueryProvider";
import ThemeProvider from "./providers/ThemeProvider";

// Self-hosted at build time by next/font rather than pulled from
// fonts.googleapis.com by the browser: no render-blocking third-party request
// on every visit, and no flash of fallback text while the file arrives.
//
// The variable axis carries 100..900, so every weight the UI asks for comes
// out of this one font rather than a separate download per weight. The name
// here must match --font-roboto-condensed in globals.css, which is what
// Tailwind's font-sans actually resolves to.
const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Naxified — Business Management",
    template: "%s | Naxified",
  },
  description:
    "Naxified is a modular management platform for running a business: team, inventory, sales and finance in one workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${robotoCondensed.variable} antialiased font-sans`}
      >
        {/* Baseline keyboard accessibility - the first tab stop on every page. */}
        <a
          href="#main-content"
          className="sr-only rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <QueryProviders>
            {children}
            <Toaster position="top-right" richColors />
          </QueryProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
