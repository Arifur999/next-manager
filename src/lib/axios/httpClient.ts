/* eslint-disable @typescript-eslint/no-explicit-any */
import { getNewTokensWithRefreshToken } from '@/services/auth.services';
import { ApiResponse } from '@/types/api.types';
import axios from 'axios';
import { cookies, headers } from 'next/headers';
import { isTokenExpiringSoon } from '../tokenUtils';

/**
 * Where THIS process reaches the API.
 *
 * Everything in this file runs on the server - it reads cookies() and
 * headers() from next/headers - so it wants a route the container has, which
 * behind nginx is not the route the browser has.
 *
 * NEXT_PUBLIC_API_BASE_URL is the browser's answer: it is inlined into the
 * bundle at build time and used by useChatSocket to open the WebSocket, so it
 * has to be the PUBLIC origin. From inside the web container that same URL
 * points at the web container itself.
 *
 * So API_INTERNAL_URL wins here when it is set - in compose it is
 * http://api:5000/api/v1, straight over the container network with no proxy
 * hop - and the public value is the fallback, which is what a single-process
 * dev machine has and all it needs.
 */
const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error(
        'Neither API_INTERNAL_URL nor NEXT_PUBLIC_API_BASE_URL is defined in environment variables'
    );
}

async function tryRefreshToken(accessToken: string, refreshToken: string): Promise<void> {
    if (!(await isTokenExpiringSoon(accessToken))) {
        return;
    }

    const requestHeader = await headers();

    // Several Server Components render in one request tree. Without this flag
    // each of them would fire its own refresh against the same refresh token,
    // and whichever landed last would win while the others got a 401.
    if (requestHeader.get("x-token-refreshed") === "1") {
        return;
    }

    try {
        await getNewTokensWithRefreshToken(refreshToken);
    } catch (error: any) {
        console.error("Error refreshing token in http client:", error);
    }
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
