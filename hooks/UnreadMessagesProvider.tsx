import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "expo-router";
import { useWebSocket } from "@/hooks/WebSocketProvider";
import { useAuth } from "@/hooks/AuthProvider";
import { getInbox } from "@/api/chatApi";

type UnreadMessagesContextValue = {
    unreadCount: number;
    clearUnread: () => void;
};

const UnreadMessagesContext = createContext<UnreadMessagesContextValue | null>(null);

export function UnreadMessagesProvider({ children }: { children: React.ReactNode }) {
    const { onChatMessage } = useWebSocket();
    const { token, loading: authLoading } = useAuth();
    const pathname = usePathname();

    const [unreadCount, setUnreadCount] = useState(0);

    // Keep a ref so the WS callback always reads the latest pathname without stale closure
    const pathnameRef = useRef(pathname);
    useEffect(() => {
        pathnameRef.current = pathname;
    }, [pathname]);

    // Load initial unread count from inbox on mount
    useEffect(() => {
        if (authLoading || !token) return;
        getInbox(50)
            .then((items) => {
                const total = items.reduce((sum, item) => sum + (item.unreadCount ?? 0), 0);
                setUnreadCount(total);
            })
            .catch(() => {
                // Non-critical — badge simply stays at 0
            });
    }, [authLoading, token]);

    // Increment on incoming WS message, unless user is already inside that conversation
    useEffect(() => {
        const unsubscribe = onChatMessage((msg) => {
            const activeConvId = Number(pathnameRef.current.split("/chat/")[1]) || null;
            if (msg.conversationId === activeConvId) return;
            setUnreadCount((prev) => prev + 1);
        });
        return unsubscribe;
    }, [onChatMessage]);

    const clearUnread = () => setUnreadCount(0);

    const value = useMemo(
        () => ({ unreadCount, clearUnread }),
        [unreadCount]
    );

    return (
        <UnreadMessagesContext.Provider value={value}>
            {children}
        </UnreadMessagesContext.Provider>
    );
}

export function useUnreadMessages() {
    const ctx = useContext(UnreadMessagesContext);
    if (!ctx) {
        throw new Error("useUnreadMessages must be used within UnreadMessagesProvider");
    }
    return ctx;
}
