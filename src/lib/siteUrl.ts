import "server-only"

import { getEnv } from "@/env"

/** Absolute origin of the public site, without a trailing slash. */
export const getSiteUrl = (): string => {
  const url = getEnv().SITE_URL ?? "http://localhost:3000"
  return url.replace(/\/+$/, "")
}
