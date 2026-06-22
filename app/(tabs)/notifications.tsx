import React, { useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell } from "lucide-react-native";
import { useIsFocused } from "@react-navigation/native";

import { NotificationCard } from "@/components/notifications/NotificationCard";
import { EmptyState } from "@/components/notifications/EmptyState";
import { useNotifications } from "@/hooks/NotificationProvider";
import {getNotificationUi} from "@/components/ui/notificationUi";
import {formatNotificationTime} from "@/constants/utils";

export default function NotificationsScreen() {
    const { notifications, loading, markAllAsRead, markAsRead } = useNotifications();
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            markAllAsRead();
        }
    }, [isFocused]);

    return (
        <View className="flex-1 bg-[#F8F9FC]">
            <SafeAreaView className="flex-1">
                <View className="flex-1">
                    <View className="px-6 pt-4 pb-5">
                        <View className="mb-3 flex-row-reverse items-center justify-between">
                            <View className="flex-row-reverse items-center gap-3">
                                <Bell size={33} color="#2E86DE" />
                                <Text className="text-4xl font-bold text-[#1A1A2E]">התראות</Text>
                            </View>
                        </View>

                        <Text className="text-right text-base text-[#6B7280]">
                            כל העדכונים החשובים במקום אחד
                        </Text>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                    >
                        {loading ? (
                            <View className="items-center justify-center py-12">
                                <ActivityIndicator size="large" color="#2E86DE" />
                            </View>
                        ) : notifications.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <View className="gap-4">
                                {notifications.map((notification) => {
                                    const ui = getNotificationUi(notification.type);

                                    return (
                                        <NotificationCard
                                            key={String(notification.id)}
                                            icon={ui.icon}
                                            iconColor={ui.iconColor}
                                            title={notification.title}
                                            description={notification.message}
                                            timestamp={formatNotificationTime(notification.createdAt)}
                                            isUnread={!notification.read}
                                        />
                                    );
                                })}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    );
}
