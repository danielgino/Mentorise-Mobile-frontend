import React from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GRADIENT_COLORS_PRIMARY, GRADIENT_START, GRADIENT_END_HORIZONTAL } from "@/constants/theme";
import { ChatAvatar } from "@/components/chat/ChatAvatar";

export type ConversationRowProps = {
    avatar: string;
    avatarUrl?: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    unreadCount?: number;
    isRead?: boolean;
    onPress?: () => void;
};

export function ConversationRow({
                                    avatar,
                                    avatarUrl,
                                    name,
                                    lastMessage,
                                    timestamp,
                                    unreadCount = 0,
                                    isRead = true,
                                    onPress,
                                }: ConversationRowProps) {
    const nameClass = "text-[#1A1A2E]";
    const messageClass = !isRead ? "text-[#1A1A2E] font-semibold" : "text-[#9CA3AF]";

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            className="flex-row-reverse items-center px-5 py-4 border-b border-[rgba(0,0,0,0.07)]"
            style={({ pressed }) => [{ backgroundColor: pressed ? "#F0F4FF" : "#FFFFFF" }]}
        >
            {/* Avatar */}
            <View className="shrink-0">
                <ChatAvatar initials={avatar} avatarUrl={avatarUrl} size={64} />
            </View>

            <View className="w-4" />

            {/* Name + last message */}
            <View className="flex-1 min-w-0">
                <Text
                    numberOfLines={1}
                    className={`text-base font-bold text-right mb-1.5 ${nameClass}`}
                    style={{ writingDirection: "rtl" }}
                >
                    {name}
                </Text>

                <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className={`text-sm text-right ${messageClass}`}
                    style={{ writingDirection: "rtl" }}
                >
                    {lastMessage?.trim() ? lastMessage : "אין הודעות עדיין"}
                </Text>
            </View>

            <View className="w-4" />

            {/* Timestamp + unread badge */}
            <View className="items-center shrink-0">
                <Text className="text-sm text-[#9CA3AF]">{timestamp}</Text>
                {unreadCount > 0 ? (
                    <View className="mt-2">
                        <UnreadBadge count={unreadCount} />
                    </View>
                ) : null}
            </View>
        </Pressable>
    );
}

function UnreadBadge({ count }: { count: number }) {
    return (
        <LinearGradient
            colors={GRADIENT_COLORS_PRIMARY}
            start={GRADIENT_START}
            end={GRADIENT_END_HORIZONTAL}
            style={{
                minWidth: 24,
                height: 24,
                paddingHorizontal: 7,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Text className="text-xs font-bold text-white">{count}</Text>
        </LinearGradient>
    );
}