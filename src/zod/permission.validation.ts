import { z } from "zod"
import { SCOPE_VALUES } from "@/types/permission.types"

// Checked for shape, not against a list: the catalogue arrives with every read.
// Slugs only, because clearing an override puts its module and action in the
// API path.
const slug = (label: string) => z.string().regex(/^[a-z][a-z_]*$/, `Unknown ${label}`)

export const permissionCellServerZodSchema = z.object({
    module: slug("module"),
    action: slug("action"),
})

export const userPermissionServerZodSchema = permissionCellServerZodSchema.extend({
    scope: z.enum(SCOPE_VALUES, "Unknown scope"),
})

export const rolePermissionServerZodSchema = userPermissionServerZodSchema.extend({
    role: slug("role"),
})
