import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
