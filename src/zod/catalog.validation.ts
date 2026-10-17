import { z } from "zod"
import { optionalNonNegative, toNumber } from "./formFields"

// Turning a service or a category off or on again: one already sold is kept
// so its invoice lines still say what they were for.
export const activeStateServerZodSchema = z.object({
    is_active: z.boolean("is_active must be true or false"),
})

// The Select's value for "ungrouped", because it cannot hold "". The API wants null.
export const NO_CATEGORY = "__none__"

const toCategoryId = (value: string) => (!value || value === NO_CATEGORY ? null : value)

export const serviceFormZodSchema = z.object({
    name: z.string().trim().min(1, "Give it a name").max(80, "That is longer than a name"),
    description: z.string().trim().max(300, "Keep it under 300 characters"),
    category_id: z.string(),
    default_price_usd: optionalNonNegative("Usual price"),
})

export type IServiceFormValues = z.infer<typeof serviceFormZodSchema>

export const serviceServerZodSchema = serviceFormZodSchema.transform((values) => ({
    name: values.name,
    description: values.description,
    category_id: toCategoryId(values.category_id),
    // Blank means "type it each time", which the API stores as zero.
    default_price_usd: toNumber(values.default_price_usd) ?? 0,
}))

export const serviceCategoryFormZodSchema = z.object({
    name: z.string().trim().min(1, "Give it a name").max(60, "Keep the name under 60 characters"),
})

export type IServiceCategoryFormValues = z.infer<typeof serviceCategoryFormZodSchema>

// The trimmed name is the whole payload.
export const serviceCategoryServerZodSchema = serviceCategoryFormZodSchema

export const serviceTemplateFormZodSchema = z.object({
    name: z.string().trim().min(1, "Give it a name").max(80, "That is longer than a name"),
    // How many of each picked service, keyed by service id.
    quantities: z
        .record(z.string(), z.number().positive("A quantity of zero is not a line"))
        .refine((quantities) => Object.keys(quantities).length > 0, "Pick at least one service"),
})

export type IServiceTemplateFormValues = z.infer<typeof serviceTemplateFormZodSchema>

export const serviceTemplateServerZodSchema = serviceTemplateFormZodSchema.transform((values) => ({
    name: values.name,
    items: Object.entries(values.quantities).map(([service_id, quantity]) => ({ service_id, quantity })),
}))
