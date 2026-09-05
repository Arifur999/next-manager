import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * What the container copies out.
   *
   * "standalone" writes .next/standalone: server.js plus only the node_modules
   * the built pages actually import, traced file by file. The Docker image
   * copies that instead of installing a production tree, which is both smaller
   * and impossible to get wrong - nothing is in it that nothing imports.
   *
   * Additive. `next start` and `next dev` behave exactly as before, and the
   * verification build still works, so nothing outside Docker notices.
   */
  output: "standalone",

  /**
   * Where the build output goes.
   *
   * `next build` and `next dev` share `.next` by default, and a build run
   * while the dev server is up overwrites the manifests it is serving from —
   * every route then 404s until dev is restarted. That is not a hypothetical:
   * it took the running site down mid-session.
   *
   * So a verification build can be sent somewhere else:
   *
   *     NEXT_DIST_DIR=.next-check npm run build
   *
   * Deploys leave the variable unset and keep the standard `.next`.
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
