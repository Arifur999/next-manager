"use client"

import Link from "next/link"

// Replaces the root layout, so it gets no global CSS: inline styles only.
const GlobalError = ({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) => (
  <html lang="en">
    <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
      <title>Something went wrong</title>
      <main
        role="alert"
        style={{ maxWidth: 420, margin: "15vh auto", padding: "0 24px", textAlign: "center", lineHeight: 1.5 }}
      >
        <h1 style={{ fontSize: 20 }}>This page could not be loaded</h1>
        <p>Something went wrong on our side. Try again, and if it keeps happening, share the reference below.</p>
        {error.digest && <p style={{ fontFamily: "monospace", fontSize: 12 }}>Reference: {error.digest}</p>}
        <p style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button type="button" onClick={() => retry()}>
            Retry
          </button>
          <Link href="/">Go home</Link>
        </p>
      </main>
    </body>
  </html>
)

export default GlobalError
