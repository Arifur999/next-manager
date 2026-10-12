/** A grouping for what the agency sells. */
export interface IServiceCategory {
    id: string;
    name: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    _count?: { services: number };
}

/**
 * Something the agency sells.
 *
 * `default_price_usd` is a starting point, not the price — every invoice line
 * keeps its own, so editing this never restates an invoice already sent. Zero
 * means "type it each time", which is a real way to sell rather than a missing
 * value.
 */
export interface IService {
    id: string;
    name: string;
    description: string;
    default_price_usd: number;
    is_active: boolean;
    sort_order: number;
    category: { id: string; name: string } | null;
    /** What is riding on it — what makes deleting one refusable. */
    _count?: { invoice_items: number; projects: number; template_items: number };
}

/**
 * A named bundle, so a repeat offer is one pick rather than five.
 *
 * Carries no price of its own on purpose: what it costs is the sum of what its
 * lines are actually sold at, and a stored total would be a second answer to
 * what the client owes.
 */
export interface IServiceTemplate {
    id: string;
    name: string;
    description: string;
    is_active: boolean;
    items: Array<{
        id: string;
        quantity: number;
        sort_order: number;
        service: { id: string; name: string; default_price_usd: number; is_active: boolean };
    }>;
}

/**
 * What each service has been billed.
 *
 * Billed, not collected: a payment settles a whole invoice rather than a line,
 * so attributing part of one to a service would mean inventing an allocation.
 * A row with an empty service id is the lines somebody typed by hand.
 */
export interface IServiceRevenue {
    service: { id: string; name: string };
    billed_usd: number;
    line_count: number;
}

/**
 * One service, with where it is actually being sold.
 *
 * No money on it on purpose: which clients bought a service is a sales fact,
 * what it earned is an income one, and that lives on the admin's revenue
 * report.
 */
export interface IServiceDetail extends IService {
    projects: Array<{
        id: string;
        name: string;
        code: string;
        status: { id: string; name: string; category: string } | null;
        client: { id: string; name: string; company: string } | null;
    }>;
    clients: Array<{ id: string; name: string; company: string }>;
}
