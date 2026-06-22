import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useWebSocket } from "@/hooks/WebSocketProvider";
import { useAuth } from "@/hooks/AuthProvider";
import {
    getMyNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    normalizeNotification
} from "@/api/notificationApi";
import { NotificationDto, NotificationRawDto } from "@/types/notification";

type NotificationContextValue = {
    notifications: NotificationDto[];
    loading: boolean;
    unreadCount: number;
    refreshNotifications: () => Promise<void>;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);


export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { onNotification } = useWebSocket();
    const { token, loading: authLoading } = useAuth();

    const [notifications, setNotifications] = useState<NotificationDto[]>([]);
    const [loading, setLoading] = useState(false);

    const seenIdsRef = useRef(new Set<number>());

    const refreshNotifications = async () => {
        try {
            setLoading(true);

            const page = await getMyNotifications(0, 20);

            setNotifications(page.content);
            seenIdsRef.current = new Set(page.content.map((n) => n.id));
        } catch (error) {
            if (__DEV__) console.warn("Failed to load notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await markNotificationAsRead(id);

            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
        } catch (error) {
            if (__DEV__) console.warn("Failed to mark notification as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();

            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true }))
            );
        } catch (error) {
            if (__DEV__) console.warn("Failed to mark all notifications as read", error);
        }
    };

    useEffect(() => {
        if (authLoading || !token) return;
        refreshNotifications();
    }, [authLoading, token]);

    useEffect(() => {
        const unsubscribe = onNotification((incoming) => {
            const normalized = normalizeNotification(incoming);

            if (seenIdsRef.current.has(normalized.id)) return;
            seenIdsRef.current.add(normalized.id);

            setNotifications((prev) => [normalized, ...prev]);
        });

        return unsubscribe;
    }, [onNotification]);

    const unreadCount = useMemo(() => {
        return notifications.filter((n) => !n.read).length;
    }, [notifications]);

    const value = useMemo(
        () => ({
            notifications,
            loading,
            unreadCount,
            refreshNotifications,
            markAsRead,
            markAllAsRead,
        }),
        [notifications, loading, unreadCount]
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
        throw new Error("useNotifications must be used within NotificationProvider");
    }
    return ctx;
}