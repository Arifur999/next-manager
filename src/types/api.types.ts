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
}

export interface ApiErrorResponse {
    success: boolean;
    message: string;
}
