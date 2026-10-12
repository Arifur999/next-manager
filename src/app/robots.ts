import { getPublicSiteUrl } from "@/env"
import type { MetadataRoute } from "next"

// Read per request so one image serves any domain set in SITE_URL.
export const dynamic = "force-dynamic"

export default function robots(): MetadataRoute.Robots {
  const url = getPublicSiteUrl()
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/platform", "/my-profile", "/change-password", "/api/", "/styleguide"],
    },
    sitemap: `${url}/sitemap.xml`,
  }
}
