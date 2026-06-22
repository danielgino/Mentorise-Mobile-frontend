import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getToken, clearToken, saveToken } from "@/auth/tokens";
import {setAuthHeader, setUnauthorizedHandler} from "@/api/apiClient";
import { getMe } from "@/api/meApi";

type User = Awaited<ReturnType<typeof getMe>>;

type AuthCtx = {
    user: User | null;
    token: string | null;
    loading: boolean;
    signIn: (token: string) => Promise<void>;
    refresh: () => Promise<void>;
    signOut: () => Promise<void>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const bootstrap = useCallback(async () => {
        setLoading(true);
        try {
            const t = await getToken();

            if (!t) {
                setAuthHeader(null);
                setUser(null);
                setToken(null);
                return;
            }

            setAuthHeader(t);
            setToken(t);

            const me = await getMe();
            setUser(me);
        } catch {
            await clearToken();
            setAuthHeader(null);
            setUser(null);
            setToken(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void bootstrap();
    }, [bootstrap]);
    useEffect(() => {
        setUnauthorizedHandler(async () => {
            setUser(null);
            setToken(null);
        });

        return () => {
            setUnauthorizedHandler(null);
        };
    }, []);

    const signIn = useCallback(async (newToken: string) => {
        setLoading(true);
        try {
            await saveToken(newToken);
            setAuthHeader(newToken);
            setToken(newToken);

            const me = await getMe();
            setUser(me);
        } catch (e) {
            await clearToken();
            setAuthHeader(null);
            setUser(null);
            setToken(null);
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const refresh = useCallback(async () => {
        const me = await getMe();
        setUser(me);
    }, []);

    const signOut = useCallback(async () => {
        await clearToken();
        setAuthHeader(null);
        setUser(null);
        setToken(null);
    }, []);

    return (
        <Ctx.Provider value={{ user, token, loading, signIn, refresh, signOut, setUser }}>
            {children}
        </Ctx.Provider>
    );
};

export function useAuth() {
    const v = useContext(Ctx);
    if (!v) throw new Error("useAuth must be used within AuthProvider");
    return v;
}