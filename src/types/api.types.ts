export interface ApiResponse<TData = unknown> {
    success: boolean;
    message: string;
    data: TData;
    meta?: PaginationMeta;
}

// Mirrors what the backend's sendResponse() emits - note `totalPage`, singular,
// which is the field the API actually sends. Renaming it here would only move
// the mismatch somewhere harder to find.
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
    /**
     * Sums for the whole filtered list rather than the page that came back —
     * the transactions ledger sends this.
     *
     * Per currency, never across it: dollars added to taka is a number that is
     * true of nothing.
     */
    totals?: Array<{ currency: string; amount: number }>;
}

export interface ApiErrorResponse {
    success: boolean;
    message: string;
}
