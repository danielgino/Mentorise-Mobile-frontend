/**
 * InboxScreen (NativeWind)
 * מסך "הודעות":
 * - Header + כפתורי פעולה (חיפוש/חדש)
 * - שדה חיפוש RTL
 * - FlatList של ConversationRow
 * - Empty state עם כפתור "התחל שיחה"
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Search, MessagesSquare, MessageCircle } from "lucide-react-native";
import { useIsFocused } from "@react-navigation/native";

import { ConversationRow } from "./ConversationRow";
import { getInbox } from "@/api/chatApi";
import type { InboxItemDto } from "@/types/chat";
import { useWebSocket } from "@/hooks/WebSocketProvider";
import { formatInboxTime } from "@/constants/dateUtils";
import { GRADIENT_COLORS_PRIMARY } from "@/constants/theme";

type InboxScreenProps = {
    onSelectConversation: (
        conversationId: number,
        otherUserId: number,
        otherUserName: string,
        avatar?: string
    ) => void;
    onPressNewChat?: () => void;
};

function getFullName(item: InboxItemDto) {
    return `${item.otherFirstName ?? ""} ${item.otherLastName ?? ""}`.trim();
}

function getAvatarFallback(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "👤";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function InboxScreen({ onSelectConversation, onPressNewChat }: InboxScreenProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [conversations, setConversations] = useState<InboxItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { onChatMessage } = useWebSocket();
    const isFocused = useIsFocused();
    const isMounted = useRef(false);

    const loadInbox = useCallback(async (mode: "initial" | "refresh" | "silent" = "initial") => {
        try {
            if (mode === "refresh") setRefreshing(true);
            else if (mode === "initial") setLoading(true);

            setError(null);
            const data = await getInbox(30);
            setConversations(data);
        } catch (e) {
            if (__DEV__) console.warn("Failed to load inbox", e);
            setError("לא הצלחנו לטעון את השיחות");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadInbox();
    }, [loadInbox]);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        if (isFocused) loadInbox("silent");
    }, [isFocused, loadInbox]);

    useEffect(() => {
        if (!isFocused) return;
        const unsubscribe = onChatMessage(() => loadInbox("silent"));
        return unsubscribe;
    }, [isFocused, onChatMessage, loadInbox]);

    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return conversations;
        return conversations.filter((c) => {
            const name = getFullName(c).toLowerCase();
            const lastMessage = (c.lastMessageContent ?? "").toLowerCase();
            return `${name} ${lastMessage}`.includes(q);
        });
    }, [searchQuery, conversations]);

    const hasConversations = filtered.length > 0;

    return (
        <View style={{ flex: 1 }}>
            {/* ─── Header ─── */}
            <View
                className="px-5 pb-4"
                style={{ paddingTop: Platform.OS === "ios" ? 60 : 44 }}
            >
                <View className="flex-row-reverse items-center gap-3 mb-5">
                    <MessagesSquare size={35} color="#2E86DE" />
                    <Text className="text-4xl font-bold text-[#1A1A2E]">הודעות</Text>
                </View>

                <View className="relative">
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="חפש משתמש או שיחה..."
                        placeholderTextColor="#9CA3AF"
                        className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F0F4FF] text-right text-base text-[#1A1A2E]"
                        style={{
                            paddingVertical: Platform.OS === "ios" ? 14 : 12,
                            paddingRight: 18,
                            paddingLeft: 52,
                            writingDirection: "rtl",
                        }}
                    />
                    <View
                        pointerEvents="none"
                        className="absolute left-4 top-1/2 -mt-2.5"
                    >
                        <Search size={22} color="#9CA3AF" />
                    </View>
                </View>
            </View>

            {/* ─── Content ─── */}
            <View className="flex-1">
                {loading ? (
                    <View className="flex-1 items-center justify-center gap-3">
                        <ActivityIndicator size="large" color="#2E86DE" />
                        <Text className="text-base text-[#9CA3AF]">טוען שיחות...</Text>
                    </View>
                ) : error ? (
                    <View className="flex-1 items-center justify-center px-8 gap-5">
                        <Text className="text-center text-lg font-semibold text-[#1A1A2E]">
                            {error}
                        </Text>
                        <Pressable
                            onPress={() => loadInbox()}
                            className="rounded-full overflow-hidden"
                            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                        >
                            <LinearGradient
                                colors={GRADIENT_COLORS_PRIMARY}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    paddingHorizontal: 28,
                                    paddingVertical: 14,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {/* ← כפתור — text-base */}
                                <Text className="text-base font-bold text-white">נסה שוב</Text>
                            </LinearGradient>
                        </Pressable>
                    </View>
                ) : hasConversations ? (
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => String(item.conversationId)}
                        onRefresh={() => loadInbox("refresh")}
                        refreshing={refreshing}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 24 }}
                        renderItem={({ item }) => {
                            const fullName = getFullName(item);
                            const avatarFallback = getAvatarFallback(fullName);
                            const avatarUrl = item.otherProfileImageUrl?.trim() || undefined;

                            return (
                                <ConversationRow
                                    avatar={avatarFallback}
                                    avatarUrl={avatarUrl}
                                    name={fullName}
                                    lastMessage={item.lastMessageContent ?? ""}
                                    timestamp={formatInboxTime(item.lastMessageAt)}
                                    unreadCount={item.unreadCount}
                                    isRead={(item.unreadCount ?? 0) === 0}
                                    onPress={() =>
                                        onSelectConversation(
                                            item.conversationId,
                                            item.otherUserId,
                                            fullName,
                                            avatarUrl ?? avatarFallback
                                        )
                                    }
                                />
                            );
                        }}
                    />
                ) : (
                    <EmptyState onPressStart={onPressNewChat} />
                )}
            </View>
        </View>
    );
}

function EmptyState({ onPressStart }: { onPressStart?: () => void }) {
    return (
        <View className="flex-1 items-center justify-center px-8 py-12 gap-4">
            <View
                style={{
                    width: 104,
                    height: 104,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "rgba(46,134,222,0.15)",
                    backgroundColor: "#F0F4FF",
                }}
            >
                <MessageCircle size={48} color="#2E86DE" />
            </View>

            <Text className="mt-2 text-2xl font-bold text-center text-[#1A1A2E]">
                אין שיחות עדיין
            </Text>

            <Text
                className="text-base text-center text-[#9CA3AF]"
                style={{ writingDirection: "rtl" }}
            >
                התחל שיחה חדשה עם מתרגל
            </Text>

            <Pressable
                onPress={onPressStart}
                accessibilityRole="button"
                className="mt-2 rounded-full overflow-hidden"
                style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
                <LinearGradient
                    colors={GRADIENT_COLORS_PRIMARY}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                        paddingHorizontal: 32,
                        paddingVertical: 14,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {/* ← כפתור — text-base */}
                    <Text
                        className="text-base font-bold text-white"
                        style={{ writingDirection: "rtl" }}
                    >
                        מצא מתרגלים
                    </Text>
                </LinearGradient>
            </Pressable>
        </View>
    );
}