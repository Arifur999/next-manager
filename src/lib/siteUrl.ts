import "server-only"

import { getPublicSiteUrl } from "@/env"

/** Absolute origin of the public site, without a trailing slash. */
export const getSiteUrl = (): string => getPublicSiteUrl()
