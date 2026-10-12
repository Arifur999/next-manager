import { getPublicSiteUrl } from "@/env"
import type { MetadataRoute } from "next"

export const dynamic = "force-dynamic"

// Public, indexable pages only. Invite, reset and styleguide pages are noindex.
export default function sitemap(): MetadataRoute.Sitemap {
  const url = getPublicSiteUrl()
  return [
    { url, changeFrequency: "monthly", priority: 1 },
    { url: `${url}/register`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${url}/login`, changeFrequency: "yearly", priority: 0.3 },
  ]
}
