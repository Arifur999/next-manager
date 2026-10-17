import { z } from "zod"

export { toNumber } from "./formFields"

export const clientFormZodSchema = z.object({
    name: z.string().min(1, "Name is required"),
    company: z.string().optional(),
    email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    country: z.string().optional(),
    status: z.enum(["active", "inactive", "archived"]).optional(),
    notes: z.string().optional(),
})

export type IClientFormValues = z.infer<typeof clientFormZodSchema>
