import { z } from "zod"

// GET /api/v1/public/plans. The API sends prices as numbers; a numeric string is
// accepted too so a Decimal serialised by a proxy still parses.
const money = z.union([z.number(), z.string().regex(/^\d+(\.\d+)?$/).transform(Number)]).pipe(z.number().nonnegative())
const limit = z.number().int().positive().nullable()

export const publicPlanSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  price: money,
  currency: z.literal("USD"),
  billing_interval: z.literal("month"),
  trial_days: z.number().int().nonnegative().nullable(),
  max_seats: limit,
  max_projects: limit,
  features: z.array(z.string()),
})

export type PublicPlan = z.infer<typeof publicPlanSchema>

export const publicPlansResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(publicPlanSchema),
})

/** The trial a new workspace gets on sign-up, or null when there is none. */
export const signupTrialDays = (plans: PublicPlan[]): number | null => {
  const days = plans.find((plan) => plan.trial_days !== null)?.trial_days ?? null
  return days !== null && days > 0 ? days : null
}
