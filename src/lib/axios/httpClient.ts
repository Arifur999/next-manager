import "server-only";

import { reportApiFailure } from "@/lib/apiFailure";
import { AUTH_COOKIE_NAMES } from "@/lib/authCookies";
import { getApiBaseUrl } from "@/env"
import { getNewTokensWithRefreshToken } from "@/lib/refreshSession";
import { isTokenExpiringSoon } from "@/lib/tokenUtils";
import type { ApiResponse } from "@/types/api.types";
import axios, { type Method } from "axios";
import { cookies, headers } from "next/headers";
import { cache } from "react";

export interface ApiRequestOptions {
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
}

// React's cache() makes the sidebar, navbar and page share one refresh per request.
const refreshOncePerRequest = cache(async (refreshToken: string): Promise<void> => {
    await getNewTokensWithRefreshToken(refreshToken);
});

const refreshIfExpiring = async (accessToken: string, refreshToken: string) => {
    if (!isTokenExpiringSoon(accessToken)) return;
    // The proxy already refreshed for this request.
    if ((await headers()).get("x-token-refreshed") === "1") return;
    await refreshOncePerRequest(refreshToken);
};

// Only the session travels to the API; theme and third-party cookies stay here.
const buildCookieHeader = async () => {
    const cookieStore = await cookies();
    return AUTH_COOKIE_NAMES.flatMap((name) => {
        const value = cookieStore.get(name)?.value;
        return value ? [`${name}=${value}`] : [];
    }).join("; ");
};

// Query strings can carry search terms, so logs get the path only.
const withoutQuery = (endpoint: string) => endpoint.split("?")[0];

const send = async <TData>(
    method: Method,
    endpoint: string,
    body: unknown,
    options: ApiRequestOptions = {},
    isMultipart = false
): Promise<ApiResponse<TData>> => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;
    if (accessToken && refreshToken) await refreshIfExpiring(accessToken, refreshToken);

    // Multipart leaves Content-Type to axios so it can add the boundary.
    const baseHeaders: Record<string, string> = { Cookie: await buildCookieHeader() };
    if (!isMultipart) baseHeaders["Content-Type"] = "application/json";

    try {
        const response = await axios.request<ApiResponse<TData>>({
            baseURL: getApiBaseUrl(),
            url: endpoint,
            method,
            data: body,
            params: options.params,
            timeout: 30000,
            headers: { ...baseHeaders, ...options.headers },
        });
        return response.data;
    } catch (error) {
        throw reportApiFailure(`${method} ${withoutQuery(endpoint)}`, error);
    }
};

// Turning an error into a message for the user is the action layer's job.
export const httpClient = {
    get: <TData>(endpoint: string, options?: ApiRequestOptions) =>
        send<TData>("GET", endpoint, undefined, options),
    post: <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions) =>
        send<TData>("POST", endpoint, data, options),
    put: <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions) =>
        send<TData>("PUT", endpoint, data, options),
    patch: <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions) =>
        send<TData>("PATCH", endpoint, data, options),
    delete: <TData>(endpoint: string, options?: ApiRequestOptions) =>
        send<TData>("DELETE", endpoint, undefined, options),
    postFormData: <TData>(endpoint: string, formData: FormData, options?: ApiRequestOptions) =>
        send<TData>("POST", endpoint, formData, options, true),
    patchFormData: <TData>(endpoint: string, formData: FormData, options?: ApiRequestOptions) =>
        send<TData>("PATCH", endpoint, formData, options, true),
};
