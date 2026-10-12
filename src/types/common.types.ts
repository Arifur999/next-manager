export type Currency = "USD" | "BDT";

/**
 * What a status MEANS, as opposed to what an agency calls it.
 *
 * The name is theirs to change; this is what the product reasons about. A
 * board column called "Shipped" or "Client approved" is `done` either way,
 * and that is what stops the clock.
 */
export type StatusCategory = "open" | "active" | "blocked" | "done" | "cancelled";

/** The status as it travels on a task or project row. */
export interface IStatusRef {
    id: string;
    name: string;
    category: StatusCategory;
    sort_order: number;
}
