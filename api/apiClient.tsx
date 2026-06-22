// src/api/apiClient.ts
import axios, { AxiosError } from "axios";
import { clearToken } from "@/auth/tokens";

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

let inMemoryToken: string | null = null;

export function setAuthHeader(token: string | null) {
    inMemoryToken = token;
    if (token) {
        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common.Authorization;
    }
}

export function getAuthHeader() {
    return apiClient.defaults.headers.common.Authorization;
}

let unauthorizedHandler: null | (() => Promise<void> | void) = null;
let handlingUnauthorized = false;

export function setUnauthorizedHandler(handler: (() => Promise<void> | void) | null) {
    unauthorizedHandler = handler;
}

apiClient.interceptors.response.use(
    (res) => res,
    async (error: AxiosError<any>) => {
        const status = error.response?.status;

        if (status === 401 && !handlingUnauthorized) {
            handlingUnauthorized = true;
            try {
                await clearToken();
                setAuthHeader(null);
                await unauthorizedHandler?.();
            } finally {
                handlingUnauthorized = false;
            }
        }

        return Promise.reject(error);
    }
);