/**
 * Module + Action + Scope.
 *
 * The first two say which door; the third says how much of the room is yours
 * once you are through it. Mirrors `permissionCatalogue.ts` on the server, but
 * only the SHAPE is mirrored — the lists themselves arrive with every read, so
 * a module added on the server appears here without a deploy, and the grid can
 * never draw a column the server would refuse to save.
 */

export const SCOPE_VALUES = ["all", "assigned", "own", "none"] as const

export type PermissionScope = (typeof SCOPE_VALUES)[number]

export interface IPermissionCatalogue {
    modules: Array<{ module: string; actions: string[] }>
    actions: string[]
    scopes: PermissionScope[]
}

export interface IRolePermissionRow {
    role: string
    module: string
    action: string
    scope: PermissionScope
}

export interface IUserPermissionRow {
    module: string
    action: string
    scope: PermissionScope
}

export interface IPermissionGrid {
    catalogue: IPermissionCatalogue
    roles: string[]
    role_permissions: IRolePermissionRow[]
    /** Null when nobody was asked about — which is not the same as no overrides. */
    user: { id: string; full_name: string; role: string } | null
    user_permissions: IUserPermissionRow[] | null
}

/**
 * What each scope means in a sentence, because "assigned" and "own" read as
 * the same word to anybody who has not implemented them.
 */
export const SCOPE_INFO: Record<PermissionScope, { label: string; description: string }> = {
    all: { label: "Everything", description: "Every record in the company" },
    assigned: { label: "Assigned", description: "Only what they are put on" },
    own: { label: "Their own", description: "Only records they created or hold" },
    none: { label: "Nothing", description: "The list is empty and an id is a 404" },
}

/** Titles for the grid's rows and columns. The server sends slugs. */
export const MODULE_LABEL: Record<string, string> = {
    clients: "Clients",
    services: "Services",
    projects: "Projects",
    tasks: "Tasks",
    team: "Team",
    chat: "Chat",
    accounts: "Accounts",
    reports: "Reports",
    vault: "Vault",
    attendance: "Attendance",
    leave: "Leave",
    time: "Time",
}

export const ACTION_LABEL: Record<string, string> = {
    view: "View",
    create: "Create",
    edit: "Edit",
    delete: "Delete",
    assign: "Assign",
}

export const ROLE_LABEL: Record<string, string> = {
    admin: "Admin",
    sales: "Sales",
    project_manager: "Project Manager",
    operations: "Operations",
}

/** A slug the labels above have not been taught still has to read as itself. */
export const titleise = (value: string) =>
    value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
