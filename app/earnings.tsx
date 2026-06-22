import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";
import { router, Stack } from "expo-router";
import { ArrowRight, BookOpen, Clock } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/hooks/AuthProvider";
import {
    getCurrentCycle,
    getPreviousCycles,
    type PaymentCycle,
} from "@/api/earningsApi";
import { GlassCard } from "@/components/ui/GlassCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { EarningsLessonRow } from "@/components/earnings/EarningsLessonRow";
import { PreviousCycleRow } from "@/components/earnings/PreviousCycleRow";

const PAGE_SIZE = 5;

export default function EarningsScreen() {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currentCycle, setCurrentCycle] = useState<PaymentCycle | null>(null);
    const [previousCycles, setPreviousCycles] = useState<PaymentCycle[]>([]);
    const [historyPage, setHistoryPage] = useState(0);
    const [historyLast, setHistoryLast] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const load = useCallback(
        async (isInitial = false) => {
            if (!user) return;
            try {
                if (isInitial) setLoading(true);
                setError(null);
                const [cycle, history] = await Promise.all([
                    getCurrentCycle(user.userId),
                    getPreviousCycles(user.userId, 0, PAGE_SIZE),
                ]);
                setCurrentCycle(cycle);
                setPreviousCycles(history.content);
                setHistoryPage(0);
                setHistoryLast(history.last);
            } catch {
                setError("לא הצלחנו לטעון את נתוני ההכנסות");
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [user]
    );

    useEffect(() => {
        load(true);
    }, [load]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        load();
    }, [load]);

    const loadMore = useCallback(async () => {
        if (!user || loadingMore || historyLast) return;
        try {
            setLoadingMore(true);
            const nextPage = historyPage + 1;
            const result = await getPreviousCycles(user.userId, nextPage, PAGE_SIZE);
            setPreviousCycles((prev) => [...prev, ...result.content]);
            setHistoryPage(nextPage);
            setHistoryLast(result.last);
        } catch {
            // silent on load-more failure
        } finally {
            setLoadingMore(false);
        }
    }, [user, loadingMore, historyLast, historyPage]);

    const cycleMonthLabel = currentCycle
        ? new Intl.DateTimeFormat("he-IL", { month: "long", year: "numeric" }).format(
              new Date(currentCycle.year, currentCycle.month - 1, 1)
          )
        : "";

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={{ flex: 1, backgroundColor: "#F8F9FC" }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 48 }}
                    className="flex-1"
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {/* ─── Inline header ─── */}
                    <View style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: 10,
                        paddingHorizontal: 20,
                        paddingTop: insets.top + 8,
                        marginBottom: 20,
                    }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 24, fontFamily: "Assistant_600SemiBold", fontWeight: "600", color: "#1A1A2E", textAlign: "right" }}>
                                הכנסות
                            </Text>
                            <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "right", marginTop: 3 }}>
                                כל ההכנסות שצברת עד כה במקום אחד
                            </Text>
                        </View>
                        <Pressable
                            onPress={() => router.back()}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#F0F4FF", alignItems: "center", justifyContent: "center" }}>
                                <ArrowRight size={20} color="#1A1A2E" />
                            </View>
                        </Pressable>
                    </View>

                    {/* ─── Content ─── */}
                    {loading ? (
                        <View className="items-center justify-center py-24">
                            <ActivityIndicator size="large" color="#2E86DE" />
                        </View>
                    ) : error ? (
                        <View className="mx-5 items-center rounded-3xl border border-[rgba(0,0,0,0.07)] bg-white px-6 py-14">
                            <Text className="mb-5 text-center text-base text-[#6B7280]">{error}</Text>
                            <View className="w-40">
                                <PrimaryButton variant="secondary" onPress={() => load(true)}>
                                    נסה שוב
                                </PrimaryButton>
                            </View>
                        </View>
                    ) : (
                        <View className="gap-6 px-5">
                            {/* ─ Current cycle card ─ */}
                            <GlassCard
                                rounded="3xl"
                                accentBar
                                innerClassName="p-6 rounded-3xl"
                            >
                                {/* Month + status badge */}
                                <View className="mb-4 flex-row-reverse items-center justify-between">
                                    <Text className="text-right text-lg font-semibold text-[#1A1A2E]">
                                        {cycleMonthLabel}
                                    </Text>
                                    <View
                                        style={{
                                            backgroundColor: "#F0F4FF",
                                            borderRadius: 20,
                                            paddingHorizontal: 12,
                                            paddingVertical: 4,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: "#2E86DE",
                                                fontSize: 12,
                                                fontFamily: "Assistant_600SemiBold",
                                                fontWeight: "600",
                                            }}
                                        >
                                            מחזור נוכחי
                                        </Text>
                                    </View>
                                </View>

                                {/* Total earned */}
                                <Text className="mb-1 text-right text-5xl font-bold text-[#1A1A2E]">
                                    ₪{(currentCycle?.totalEarned ?? 0).toFixed(0)}
                                </Text>
                                <Text className="text-right text-sm text-[#6B7280]">
                                    סה"כ הכנסות החודש
                                </Text>

                                {/* Lesson count */}
                                <View className="mt-5 flex-row-reverse items-center gap-2">
                                    <BookOpen size={15} color="#2E86DE" />
                                    <Text className="text-right text-sm text-[#6B7280]">
                                        {currentCycle?.lessonCount ?? 0} שיעורים שהושלמו
                                    </Text>
                                </View>
                            </GlassCard>

                            {/* ─ Current cycle lessons ─ */}
                            <View>
                                <Text className="mb-3 text-right text-lg font-semibold text-[#1A1A2E]">
                                    שיעורים החודש
                                </Text>
                                {!currentCycle?.lessons?.length ? (
                                    <EmptyState
                                        icon={<Clock size={30} color="#9CA3AF" />}
                                        message="אין הכנסות החודש עדיין"
                                    />
                                ) : (
                                    <View className="gap-3">
                                        {currentCycle.lessons.map((lesson) => (
                                            <EarningsLessonRow
                                                key={lesson.sessionOfferId}
                                                studentName={lesson.studentName}
                                                startTime={lesson.startTime}
                                                endTime={lesson.endTime}
                                                durationMinutes={lesson.durationMinutes}
                                                price={lesson.price}
                                            />
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* ─ Payment history ─ */}
                            <View className="pb-4">
                                <Text className="mb-3 text-right text-lg font-semibold text-[#1A1A2E]">
                                    היסטוריית תשלומים
                                </Text>
                                {!previousCycles.length ? (
                                    <EmptyState message="אין מחזורי תשלום קודמים עדיין" />
                                ) : (
                                    <View className="gap-3">
                                        {previousCycles.map((cycle) => (
                                            <PreviousCycleRow key={cycle.cycleId} cycle={cycle} />
                                        ))}
                                        {!historyLast && (
                                            <View className="mt-1">
                                                <PrimaryButton
                                                    variant="secondary"
                                                    onPress={loadMore}
                                                    loading={loadingMore}
                                                    disabled={loadingMore}
                                                >
                                                    טען עוד
                                                </PrimaryButton>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>
        </>
    );
}

function EmptyState({
    icon,
    message,
}: {
    icon?: React.ReactNode;
    message: string;
}) {
    return (
        <View className="items-center rounded-3xl border border-[rgba(0,0,0,0.07)] bg-white px-6 py-12">
            {icon && <View className="mb-3">{icon}</View>}
            <Text className="text-center text-base text-[#9CA3AF]">{message}</Text>
        </View>
    );
}
