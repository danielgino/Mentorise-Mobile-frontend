import React from "react";
import { Text, View } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { GlassCard } from "@/components/ui/GlassCard";
import type { PaymentCycle } from "@/api/earningsApi";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
    PAID: { label: "שולם", color: "#1D9E75" },
    PENDING_PAYOUT: { label: "ממתין לתשלום", color: "#D97706" },
    CURRENT: { label: "מחזור נוכחי", color: "#2E86DE" },
};

interface Props {
    cycle: PaymentCycle;
    onPress?: () => void;
}

export function PreviousCycleRow({ cycle, onPress }: Props) {
    const monthLabel = new Intl.DateTimeFormat("he-IL", {
        month: "long",
        year: "numeric",
    }).format(new Date(cycle.year, cycle.month - 1, 1));

    const statusInfo = STATUS_LABEL[cycle.status] ?? { label: cycle.status, color: "rgba(255,255,255,0.5)" };

    return (
        <GlassCard
            rounded="2xl"
            borderColor="rgba(0,0,0,0.07)"
            innerClassName="p-5"
            onPress={onPress}
        >
            <View className="flex-row items-center justify-between">
                {onPress && (
                    <ChevronLeft size={17} color="#9CA3AF" />
                )}
                <View className="flex-1 gap-2 pl-1">
                    <View className="flex-row-reverse items-center justify-between">
                        <Text className="text-right text-base font-semibold text-[#1A1A2E]">
                            {monthLabel}
                        </Text>
                        <View
                            style={{
                                backgroundColor: `${statusInfo.color}22`,
                                borderRadius: 20,
                                paddingHorizontal: 10,
                                paddingVertical: 3,
                            }}
                        >
                            <Text style={{ color: statusInfo.color, fontSize: 12, fontFamily: "Assistant_600SemiBold", fontWeight: "600" }}>
                                {statusInfo.label}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row-reverse items-center gap-3">
                        <Text className="text-right text-sm text-[#9CA3AF]">
                            {cycle.lessonCount} שיעורים
                        </Text>
                        <Text
                            className="text-right text-sm font-semibold"
                            style={{ color: "#2E86DE" }}
                        >
                            ₪{cycle.totalEarned.toFixed(0)}
                        </Text>
                    </View>
                </View>
            </View>
        </GlassCard>
    );
}
