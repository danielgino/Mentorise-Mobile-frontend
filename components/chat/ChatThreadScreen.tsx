/**
 * ChatThreadScreen (NativeWind)
 * מסך שיחה מלא:
 * - Header עליון + פעולות + שם/סטטוס + אוואטר
 * - FlatList הודעות + מפרידי תאריך דינמיים
 * - Composer תחתון לשליחה
 * - תמיכה בפתיחת מודל "קבע שיעור" מתוך ChatComposer
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    View,
} from "react-native";
import { ChatAvatar } from "@/components/chat/ChatAvatar";
import { ArrowRight } from "lucide-react-native";

import { ChatComposer } from "./ChatComposer";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { getMessages, markConversationAsRead } from "@/api/chatApi";
import { createSessionOffer } from "@/api/sessionApi";
import type { MessageDto } from "@/types/chat";
import { useWebSocket } from "@/hooks/WebSocketProvider";
import {LessonOfferPayload} from "@/components/LessonOfferModal";
import {SessionOfferBubble} from "@/components/chat/SessionOfferBubble";
import { formatMessageTime, getDayKey, formatDayLabel } from "@/constants/dateUtils";

type MessageStatus = "sending" | "delivered" | "read";
type MessageDirection = "incoming" | "outgoing";
type ServerMessageType = "TEXT" | "SESSION_OFFER";

export type ChatMessage = {
    id: string;
    type: MessageDirection;
    serverType: ServerMessageType;
    content: string;
    timestamp: string;
    status: MessageStatus;
    clientMessageId?: string;
    conversationId: number;
    senderId: number;
    sentAtRaw: string;
};
type ListItem =
    | { kind: "message"; data: ChatMessage }
    | { kind: "dateSeparator"; label: string; key: string };

type ChatThreadScreenProps = {
    conversationId: number;
    currentUserId: number;
    currentUserRole: string;
    otherUserId: number;
    otherUserName: string;
    avatar?: string;
    onBack: () => void;
    onOpenLessons: () => void;
    onPressProfile?: () => void;
};


function getInitials(name?: string) {
    if (!name?.trim()) return "👤";

    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }

    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

function mapServerMessageToUi(message: MessageDto, currentUserId: number): ChatMessage {
    const outgoing = message.senderId === currentUserId;

    return {
        id: String(message.id),
        clientMessageId: message.clientMessageId,
        conversationId: message.conversationId,
        senderId: message.senderId,
        type: outgoing ? "outgoing" : "incoming",
        serverType: message.type as "TEXT" | "SESSION_OFFER",
        content: message.content,
        timestamp: formatMessageTime(message.sentAt),
        status: outgoing ? "delivered" : "read",
        sentAtRaw: message.sentAt,
    };
}

function upsertMessage(prev: ChatMessage[], incoming: ChatMessage) {
    const existingIndex = prev.findIndex((msg) => {
        if (incoming.clientMessageId && msg.clientMessageId === incoming.clientMessageId) {
            return true;
        }
        return msg.id === incoming.id;
    });

    if (existingIndex !== -1) {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], ...incoming };
        return copy.sort(
            (a, b) => new Date(a.sentAtRaw).getTime() - new Date(b.sentAtRaw).getTime()
        );
    }

    return [...prev, incoming].sort(
        (a, b) => new Date(a.sentAtRaw).getTime() - new Date(b.sentAtRaw).getTime()
    );
}

function buildListItems(messages: ChatMessage[]): ListItem[] {
    const items: ListItem[] = [];
    let lastDayKey = "";

    for (const msg of messages) {
        const dayKey = getDayKey(msg.sentAtRaw);

        if (dayKey && dayKey !== lastDayKey) {
            lastDayKey = dayKey;
            items.push({
                kind: "dateSeparator",
                label: formatDayLabel(msg.sentAtRaw),
                key: `separator-${dayKey}`,
            });
        }

        items.push({ kind: "message", data: msg });
    }

    return items;
}

export function ChatThreadScreen({
                                     conversationId,
                                     currentUserId,
                                     otherUserId,
                                     currentUserRole,
                                     otherUserName,
                                     avatar,
                                     onBack,
                                     onOpenLessons,
                                     onPressProfile,
                                 }: ChatThreadScreenProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const listRef = useRef<FlatList<ListItem> | null>(null);
    const { onChatMessage, sendChatMessage } = useWebSocket();

    const listItems = useMemo(() => buildListItems(messages), [messages]);
    const reversedListItems = useMemo(() => [...listItems].reverse(), [listItems]);

    const scrollToBottom = useCallback((animated = true) => {
        requestAnimationFrame(() => {
            listRef.current?.scrollToOffset({ offset: 0, animated });
        });
    }, []);

    const loadThread = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const serverMessages = await getMessages(conversationId, { limit: 50 });
            const mapped = serverMessages.map((msg) => mapServerMessageToUi(msg, currentUserId));
            setMessages(mapped);
            setHasMore(serverMessages.length === 50);

            await markConversationAsRead(conversationId);
        } catch (e) {
            if (__DEV__) console.warn("Failed to load conversation messages", e);
            setError("לא הצלחנו לטעון את ההודעות");
        } finally {
            setLoading(false);
        }
    }, [conversationId, currentUserId]);

    const loadMoreMessages = useCallback(async () => {
        if (loadingMore || !hasMore || messages.length === 0) return;

        const oldestServerMessage = messages.find(m => !m.id.startsWith("local-"));
        if (!oldestServerMessage) return;

        setLoadingMore(true);
        try {
            const older = await getMessages(conversationId, {
                cursorId: Number(oldestServerMessage.id),
                limit: 50,
            });

            if (older.length === 0) {
                setHasMore(false);
                return;
            }

            if (older.length < 50) setHasMore(false);

            const mapped = older.map(m => mapServerMessageToUi(m, currentUserId));
            setMessages(prev => {
                const combined = [...mapped, ...prev];
                const seen = new Set<string>();
                return combined
                    .filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true; })
                    .sort((a, b) => new Date(a.sentAtRaw).getTime() - new Date(b.sentAtRaw).getTime());
            });
        } catch (e) {
            if (__DEV__) console.warn("Failed to load older messages", e);
        } finally {
            setLoadingMore(false);
        }
    }, [loadingMore, hasMore, messages, conversationId, currentUserId]);

    useEffect(() => {
        loadThread();
    }, [loadThread]);

    useEffect(() => {
        const unsubscribe = onChatMessage((incoming) => {
            if (incoming.conversationId !== conversationId) return;

            const mapped = mapServerMessageToUi(incoming, currentUserId);
            setMessages((prev) => upsertMessage(prev, mapped));

            if (incoming.senderId !== currentUserId) {
                markConversationAsRead(conversationId).catch((err) => {
                    if (__DEV__) console.warn("Failed to mark conversation as read", err);
                });
            }

            scrollToBottom();
        });

        return unsubscribe;
    }, [conversationId, currentUserId, onChatMessage, scrollToBottom]);

    const handleSendMessage = useCallback(
        (content: string) => {
            const trimmed = content.trim();
            if (!trimmed) return;

            const nowIso = new Date().toISOString();
            const clientMessageId = sendChatMessage({ conversationId, content: trimmed });

            const optimisticMessage: ChatMessage = {
                id: `local-${clientMessageId}`,
                clientMessageId,
                conversationId,
                senderId: currentUserId,
                type: "outgoing",
                serverType: "TEXT",
                content: trimmed,
                timestamp: formatMessageTime(nowIso),
                status: "sending",
                sentAtRaw: nowIso,
            };

            setMessages((prev) => upsertMessage(prev, optimisticMessage));
            scrollToBottom();
        },
        [conversationId, currentUserId, sendChatMessage, scrollToBottom]
    );

    const handleCreateSessionOffer = useCallback(
        async (payload: LessonOfferPayload) => {
            if (!otherUserId) {
                if (__DEV__) console.warn("Missing otherUserId in ChatThreadScreen", { otherUserId });
                Alert.alert("שגיאה", "לא נמצא המשתמש שאליו צריך לשלוח את ההצעה");
                return;
            }

            try {
                await createSessionOffer({
                    studentUserId: otherUserId,
                    startTime: payload.startTime,
                    endTime: payload.endTime,
                    note: payload.note,
                });

                Alert.alert("הצלחה", "הצעת השיעור נשלחה");
            } catch (err: any) {
                if (__DEV__) console.warn("Failed to create session offer", err?.response?.data || err);
                Alert.alert(
                    "שגיאה",
                    err?.response?.data?.message || "לא הצלחנו לשלוח את הצעת השיעור"
                );
            }
        },
        [otherUserId]
    );

    return (
        <View style={{ flex: 1, backgroundColor: "#EEF2F8" }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
            >
                <ChatThreadHeader
                    avatar={avatar}
                    otherUserName={otherUserName}
                    onBack={onBack}
                    onPressProfile={onPressProfile}
                />

                <View className="flex-1 px-4 pb-3 pt-4">
                    {loading ? (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color="#2E86DE" />
                            <Text className="mt-3 text-[#9CA3AF]">טוען הודעות...</Text>
                        </View>
                    ) : error ? (
                        <View className="flex-1 items-center justify-center">
                            <Text className="text-center text-[#9CA3AF]">{error}</Text>
                        </View>
                    ) : (
                        <FlatList
                            ref={listRef}
                            inverted
                            data={reversedListItems}
                            keyExtractor={(item) =>
                                item.kind === "message" ? item.data.id : item.key
                            }
                            renderItem={({ item }) => {
                                if (item.kind === "dateSeparator") {
                                    return <DateSeparator label={item.label} />;
                                }

                                if (item.data.serverType === "SESSION_OFFER") {
                                    return (
                                        <SessionOfferBubble
                                            type={item.data.type}
                                            content={item.data.content}
                                            timestamp={item.data.timestamp}
                                            onPressOpenLessons={onOpenLessons}
                                        />
                                    );
                                }

                                return (
                                    <MessageBubble
                                        type={item.data.type}
                                        content={item.data.content}
                                        timestamp={item.data.timestamp}
                                        status={item.data.status}
                                    />
                                );
                            }}
                            contentContainerStyle={{ paddingBottom: 12, flexGrow: 1 }}
                            ItemSeparatorComponent={() => <View className="h-2" />}
                            onEndReached={loadMoreMessages}
                            onEndReachedThreshold={0.2}
                            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
                            ListFooterComponent={
                                loadingMore ? (
                                    <View className="items-center py-2">
                                        <ActivityIndicator size="small" color="#2E86DE" />
                                    </View>
                                ) : null
                            }
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View className="flex-1 items-center justify-center py-10">
                                    <Text className="text-center text-[#9CA3AF]">
                                        אין הודעות עדיין. שלח הודעה ראשונה.
                                    </Text>
                                </View>
                            }
                        />
                    )}
                </View>

                <ChatComposer
                    onSend={handleSendMessage}
                    isTutor={currentUserRole === "TUTOR"}
                    onCreateSessionOffer={handleCreateSessionOffer}
                />
            </KeyboardAvoidingView>
        </View>
    );
}

function DateSeparator({ label }: { label: string }) {
    return (
        <View className="my-3 items-center">
            <View className="rounded-full border border-[rgba(0,0,0,0.07)] bg-white px-4 py-1.5">
                <Text className="text-xs text-[#9CA3AF]">{label}</Text>
            </View>
        </View>
    );
}

function ChatThreadHeader({
                              otherUserName,
                              avatar,
                              onBack,
                              onPressProfile,
                          }: {
    otherUserName: string;
    avatar?: string;
    onBack: () => void;
    onPressProfile?: () => void;
}) {
    const initials = getInitials(otherUserName);

    return (
        <View
            className="border-b border-[rgba(0,0,0,0.07)] bg-white"
        >
            <View
                className="flex-row-reverse items-center px-4"
                style={{ height: 68 }}
            >
                <View className="w-10">
                    <HeaderIconButton onPress={onBack} accessibilityLabel="חזרה">
                        <ArrowRight size={20} color="#1A1A2E" />
                    </HeaderIconButton>
                </View>

                <View className="flex-1 items-center">
                    <Pressable
                        onPress={onPressProfile}
                        disabled={!onPressProfile}
                        accessibilityRole="button"
                        accessibilityLabel="פתח פרופיל"
                        hitSlop={8}
                        style={({ pressed }) => ({ opacity: pressed && onPressProfile ? 0.7 : 1 })}
                    >
                        <View className="flex-row-reverse items-center gap-3">
                            <ChatAvatar initials={initials} avatarUrl={avatar} size={54} />
                            <Text className="text-lg font-bold text-[#1A1A2E]">
                                {otherUserName}
                            </Text>
                        </View>
                    </Pressable>
                </View>

                <View className="w-10" />
            </View>
        </View>
    );
}

function HeaderIconButton({
                              children,
                              onPress,
                              accessibilityLabel,
                          }: {
    children: React.ReactNode;
    onPress?: () => void;
    accessibilityLabel: string;
}) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full bg-[#F0F4FF]"
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
        >
            {children}
        </Pressable>
    );
}