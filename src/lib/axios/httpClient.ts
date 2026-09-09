/* eslint-disable @typescript-eslint/no-explicit-any */
import { getNewTokensWithRefreshToken } from '@/lib/refreshSession';
import { ApiResponse } from '@/types/api.types';
import axios from 'axios';
import { cookies, headers } from 'next/headers';
import { cache } from 'react';
import { isTokenExpiringSoon } from '../tokenUtils';
import { SERVER_API_BASE_URL } from "@/lib/apiBaseUrl"

// Server-side, so it takes the server's route to the API. Why there are two
// routes, and which wins, is explained once in lib/apiBaseUrl.ts.
const API_BASE_URL = SERVER_API_BASE_URL

/**
 * At most one refresh attempt per request tree.
 *
 * React's cache() memoises on the arguments for the life of one request, so
 * the sidebar, the navbar and the page content share a single call instead of
 * three.
 *
 * The x-token-refreshed header alone could not do this. It is set in exactly
 * one place - the proxy - and headers() here is READ-ONLY, so this function
 * could never set it for the component rendering next to it. On any request
 * the proxy did not refresh (a next/link prefetch, which the matcher skips)
 * the flag was simply absent and every component fired its own rotation. The
 * header is still honoured, because when the proxy HAS refreshed there is
 * nothing left to do.
 */
const refreshOncePerRequest = cache(async (refreshToken: string): Promise<void> => {
    try {
        await getNewTokensWithRefreshToken(refreshToken);
    } catch (error: any) {
        console.error("Error refreshing token in http client:", error);
    }
});

async function tryRefreshToken(accessToken: string, refreshToken: string): Promise<void> {
    if (!isTokenExpiringSoon(accessToken)) {
        return;
    }

    const requestHeader = await headers();

    // The proxy already did it for this request.
    if (requestHeader.get("x-token-refreshed") === "1") {
        return;
    }

    await refreshOncePerRequest(refreshToken);
}

const buildCookieHeader = async () => {
    const cookieStore = await cookies();
    // e.g. "accessToken=abc123; refreshToken=def456"
    return cookieStore
        .getAll()
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");
};

const axiosInstance = async () => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (accessToken && refreshToken) {
        await tryRefreshToken(accessToken, refreshToken);
    }

    return axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
            Cookie: await buildCookieHeader(),
        },
    });
};

// Same as above minus Content-Type: axios has to set the multipart boundary
// itself, and an explicit header would overwrite it with one that has no
// boundary at all.
const multipartAxiosInstance = async () => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (accessToken && refreshToken) {
        await tryRefreshToken(accessToken, refreshToken);
    }

    return axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        headers: { Cookie: await buildCookieHeader() },
    });
};

export interface ApiRequestOptions {
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
}

const httpGet = async <TData>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.get<ApiResponse<TData>>(endpoint, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`GET request to ${endpoint} failed:`, error);
        throw error;
    }
};

const httpPost = async <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.post<ApiResponse<TData>>(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`POST request to ${endpoint} failed:`, error);
        throw error;
    }
};

const httpPut = async <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.put<ApiResponse<TData>>(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`PUT request to ${endpoint} failed:`, error);
        throw error;
    }
};

const httpPatch = async <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.patch<ApiResponse<TData>>(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`PATCH request to ${endpoint} failed:`, error);
        throw error;
    }
};

const httpDelete = async <TData>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.delete<ApiResponse<TData>>(endpoint, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`DELETE request to ${endpoint} failed:`, error);
        throw error;
    }
};

const httpPostFormData = async <TData>(endpoint: string, formData: FormData, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = await multipartAxiosInstance();
        const response = await instance.post<ApiResponse<TData>>(endpoint, formData, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`Multipart POST request to ${endpoint} failed:`, error);
        throw error;
    }
};

const httpPatchFormData = async <TData>(endpoint: string, formData: FormData, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = await multipartAxiosInstance();
        const response = await instance.patch<ApiResponse<TData>>(endpoint, formData, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`Multipart PATCH request to ${endpoint} failed:`, error);
        throw error;
    }
};

// Every verb logs and re-throws. Turning an axios error into a message the user
// should see is the action layer's job, not this file's.
export const httpClient = {
    get: httpGet,
    post: httpPost,
    put: httpPut,
    patch: httpPatch,
    delete: httpDelete,
    postFormData: httpPostFormData,
    patchFormData: httpPatchFormData,
};
