import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import QueryProviders from "./providers/QueryProvider";
import ThemeProvider from "./providers/ThemeProvider";

// The font files live in this repo, not on Google's servers.
//
// next/font/google also self-hosts the result, but it fetches from
// fonts.googleapis.com AT BUILD TIME - so a network hiccup on the build machine
// is a failed build, which is exactly what happened here. Nothing about the
// shipped page needed Google, only the build did, and that is a dependency
// worth not having.
//
// Both files are the latin subset of the variable face, which carries the whole
// 100..900 axis: every weight the UI asks for comes out of one file rather than
// a download per weight. The variable name must stay
// --font-roboto-condensed, which is what Tailwind's font-sans resolves to in
// globals.css.
const robotoCondensed = localFont({
  src: [
    {
      path: "./fonts/RobotoCondensed-latin-variable.woff2",
      style: "normal",
      weight: "100 900",
    },
    {
      path: "./fonts/RobotoCondensed-latin-variable-italic.woff2",
      style: "italic",
      weight: "100 900",
    },
  ],
  variable: "--font-roboto-condensed",
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
