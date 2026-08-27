import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import QueryProviders from "./providers/QueryProvider";
import ThemeProvider from "./providers/ThemeProvider";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${workSans.variable} antialiased font-sans`}>
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
