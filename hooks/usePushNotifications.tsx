import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/AuthProvider";
import { registerPushToken } from "@/api/pushTokenApi";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

export function usePushNotifications() {
    const { user } = useAuth();
    const router = useRouter();
    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);

    useEffect(() => {
        if (!user) return;

        registerForPushNotificationsAsync().then((token) => {
            if (token) {
                registerPushToken(token, Platform.OS).catch((err) => {
                    if (__DEV__) console.warn("[PushNotifications] Failed to register token with backend:", err);
                });
            }
        });

        notificationListener.current = Notifications.addNotificationReceivedListener(() => {});

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data as Record<string, string> | undefined;
            const screen = data?.screen;
            const conversationId = data?.conversationId;
            const otherUserId = data?.otherUserId;
            const otherUserName = data?.otherUserName;
            const avatar = data?.avatar ?? "";

            if (screen === "chat" && conversationId) {
                router.push({
                    pathname: "/chat/[id]",
                    params: {
                        id: conversationId,
                        otherUserId,
                        otherUserName,
                        avatar,
                    },
                } as never);
            } else {
                router.push("/(tabs)/notifications" as never);
            }
        });

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, [user]);
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
    if (Platform.OS === "web") {
        return null;
    }

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "Default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
            sound: "default",
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        if (__DEV__) console.warn("[PushNotifications] Permission not granted.");
        return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    if (!projectId) {
        if (__DEV__) console.warn("[PushNotifications] EAS projectId not found in app.json. Run: npx eas-cli@latest init");
        return null;
    }

    try {
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        return tokenData.data;
    } catch (e) {
        if (__DEV__) console.warn("[PushNotifications] Failed to get push token:", e);
        return null;
    }
}
