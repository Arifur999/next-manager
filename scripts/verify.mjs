// A production build that does not touch the running dev server.
//
// `next dev` and `next build` share .next, and building while dev is running
// clobbers it - every route 404s until dev is restarted. next.config.ts reads
// NEXT_DIST_DIR so this can build somewhere else entirely.
//
// This exists as a script rather than an inline `NEXT_DIST_DIR=… next build`
// because npm runs package scripts through cmd.exe on Windows, where that
// syntax is not a command.

import { spawn } from "node:child_process";

const child = spawn("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NEXT_DIST_DIR: ".next-check" },
});

child.on("exit", (code) => process.exit(code ?? 1));
