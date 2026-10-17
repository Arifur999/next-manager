import type { Currency } from "@/types/common.types";

export interface ApiResponse<TData = unknown> {
    success: boolean;
    message: string;
    data: TData;
    meta?: PaginationMeta;
}

// Mirrors what the backend's sendResponse() emits. `totalPages` is the house
// name and is being added beside the old `totalPage`; read it through
// pageCountOf so either API version works.
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
    /** @deprecated Use totalPages; removed from the API once this app reads it. */
    totalPage?: number;
    /**
     * Sums for the whole filtered list rather than the page that came back —
     * the transactions ledger sends this.
     *
     * Per currency, never across it: dollars added to taka is a number that is
     * true of nothing.
     */
    totals?: Array<{ currency: Currency; amount: number }>;
    /**
     * Counted across the whole window rather than the page — narrowing the
     * list must not hide the thing the security page is opened to notice.
     */
    failed_last_24h?: number;
    /** How long login history is kept, so the screen can say it. */
    retention_days?: number;
    /**
     * How much of the business is spoken for, and how much is not.
     *
     * A property of the whole shareholder list rather than of any row, and the
     * question that page is opened with — "who owns the rest" is not something
     * a reader should have to work out by subtracting.
     */
    allocated_pct?: number;
    unallocated_pct?: number;
}

export interface ApiErrorResponse {
    success: false;
    message: string;
}

// What an action hands back to the browser. Discriminated on `success`, so a
// caller that checked it can read `data` without a cast.
export type ApiResult<TData> =
    | { success: true; message: string; data: TData; meta?: PaginationMeta }
    | { success: false; message: string; fieldErrors?: Record<string, string[]> };

export const pageCountOf = (meta: Pick<PaginationMeta, "totalPages" | "totalPage"> | undefined) =>
    meta?.totalPages ?? meta?.totalPage;
