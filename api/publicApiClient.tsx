// src/api/publicApiClient.ts
import axios, { AxiosError } from "axios";
import { BASE_URL } from "@/api/apiClient";

export const publicApiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

publicApiClient.interceptors.response.use(
    (res) => res,
    (error: AxiosError<any>) => Promise.reject(error)
);
