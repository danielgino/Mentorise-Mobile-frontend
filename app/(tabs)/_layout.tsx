import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useUnreadMessages } from "@/hooks/UnreadMessagesProvider";
import { useNotifications } from "@/hooks/NotificationProvider";

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const { unreadCount } = useUnreadMessages();
    const { unreadCount: unreadNotifCount } = useNotifications();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarButton: HapticTab,

                tabBarStyle: {
                    backgroundColor: "#FFFFFF",
                    borderTopWidth: 0.5,
                    borderTopColor: "rgba(0,0,0,0.07)",
                    height: 72,
                },

                tabBarItemStyle: {
                    paddingVertical: 6,
                },


                tabBarActiveTintColor: "#2E86DE",
                tabBarInactiveTintColor: "#9CA3AF",

                tabBarLabelStyle: {
                    fontSize: 11,
                    fontFamily: "Assistant_500Medium",
                    fontWeight: "500",
                    marginTop: 2,
                },
            }}
        >






            <Tabs.Screen
                name="notifications"
                options={{
                    title: "התראות",
                    tabBarLabel: "התראות",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={25} name="bell.fill" color={color} />
                    ),
                    tabBarBadge: unreadNotifCount > 0 ? unreadNotifCount : undefined,
                    tabBarBadgeStyle: {
                        backgroundColor: "#2E86DE",
                        color: "#FFFFFF",
                        fontSize: 10,
                    },
                }}
            />

            <Tabs.Screen
                name="lessons"
                options={{
                    title: "השיעורים שלי",
                    tabBarLabel: "שיעורים",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={25} name="graduationcap.fill" color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="index"
                options={{
                    title: "בית",
                    tabBarLabel: "בית",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={25} name="house.fill" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="inbox"
                options={{
                    title: "צ'אט",
                    tabBarLabel: "צ'אט",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={25} name="bubble.left.and.bubble.right.fill" color={color} />
                    ),
                    tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
                    tabBarBadgeStyle: {
                        backgroundColor: "#2E86DE",
                        color: "#FFFFFF",
                        fontSize: 10,
                    },
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "פרופיל",
                    tabBarLabel: "פרופיל",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={25} name="person.crop.circle.fill" color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
