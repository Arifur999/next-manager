"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * next-themes writes an inline <script> into the head so the page paints in the
 * right theme instead of flashing white first. Under a nonce-based CSP that
 * script is the one thing on the page a browser would refuse to run - and
 * refusing it means the flash comes back, in the dark.
 *
 * So the nonce is threaded down from the proxy: layout.tsx reads x-nonce off
 * the request and hands it here.
 */
export default function ThemeProvider({
  children,
  nonce,
}: {
  children: React.ReactNode;
  nonce?: string;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      nonce={nonce}
    >
      {children}
    </NextThemesProvider>
  );
}
