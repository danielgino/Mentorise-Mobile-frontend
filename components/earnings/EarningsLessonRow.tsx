import React from "react";
import { Text, View } from "react-native";
import { Calendar, Clock3, User } from "lucide-react-native";
import { GlassCard } from "@/components/ui/GlassCard";
import type { EarningLesson } from "@/api/earningsApi";

const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("he-IL", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(iso));

const formatTime = (iso: string) =>
    new Intl.DateTimeFormat("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(new Date(iso));

type Props = Omit<EarningLesson, "sessionOfferId" | "status">;

export function EarningsLessonRow({ studentName, startTime, endTime, durationMinutes, price }: Props) {
    return (
        <GlassCard rounded="2xl" borderColor="rgba(0,0,0,0.07)" innerClassName="p-5">
            {/* Student name + price */}
            <View className="mb-4 flex-row-reverse items-start justify-between">
                <View className="flex-row-reverse items-center gap-2">
                    <User size={15} color="#9CA3AF" />
                    <Text className="text-right text-base font-semibold text-[#1A1A2E]">
                        {studentName}
                    </Text>
                </View>
                <View
                    style={{
                        backgroundColor: "rgba(46,134,222,0.10)",
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                    }}
                >
                    <Text style={{ color: "#2E86DE", fontSize: 15, fontFamily: "Assistant_600SemiBold", fontWeight: "600" }}>
                        ₪{price}
                    </Text>
                </View>
            </View>

            {/* Date, time, duration */}
            <View className="gap-2">
                <View className="flex-row-reverse items-center gap-2">
                    <Calendar size={14} color="#9CA3AF" />
                    <Text className="text-right text-sm text-[#9CA3AF]">{formatDate(startTime)}</Text>
                </View>
                <View className="flex-row-reverse items-center gap-2">
                    <Clock3 size={14} color="#9CA3AF" />
                    <Text className="text-right text-sm text-[#9CA3AF]">
                        {formatTime(startTime)} - {formatTime(endTime)} · {durationMinutes} דקות
                    </Text>
                </View>
            </View>
        </GlassCard>
    );
}
