import "server-only"

import { getApiBaseUrl } from "@/env"
import { logger } from "@/lib/logger"
import { publicPlansResponseSchema, type PublicPlan } from "@/zod/publicPlans.validation"
import { cache } from "react"

// The API caches this for 300 seconds; the page keeps it as long.
const REVALIDATE_SECONDS = 300

/**
 * Active plans for the public page. Never throws: when the API is down or sends
 * something unexpected, the page shows no pricing rather than a guess.
 * Wrapped in cache() so the layout and the page share one request.
 */
export const getPublicPlans = cache(async (): Promise<PublicPlan[]> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/public/plans`, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(4000),
    })
    if (!response.ok) {
      logger.warn("Public plans unavailable", { status: response.status })
      return []
    }
    const parsed = publicPlansResponseSchema.safeParse(await response.json())
    if (!parsed.success) {
      logger.warn("Public plans did not match the contract", { issues: parsed.error.issues.length })
      return []
    }
    return parsed.data.data
  } catch (error) {
    logger.warn("Public plans request failed", { name: error instanceof Error ? error.name : "unknown" })
    return []
  }
})
