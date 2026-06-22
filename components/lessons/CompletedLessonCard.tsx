import React from "react";
import { Text, View } from "react-native";
import { Calendar, Clock3, DollarSign, CheckCircle2 } from "lucide-react-native";
import { GlassCard } from "@/components/ui/GlassCard";

interface CompletedLessonCardProps {
    tutorName: string;
    date: string;
    time: string;
    price: number;
    status: string;
}

export function CompletedLessonCard({ tutorName, date, time, price, status }: CompletedLessonCardProps) {
    return (
        <GlassCard
            rounded="3xl"
            className="opacity-80"
            borderColor="rgba(0,0,0,0.08)"
            innerClassName="p-6"
        >
            <View className="mb-5 flex-row-reverse items-start justify-between">
                <Text className="flex-1 pl-3 text-right text-xl font-semibold text-[#1A1A2E]">{tutorName}</Text>
                <View className="flex-row-reverse items-center rounded-full border border-[#E5E7EB] bg-[#F8F9FC] px-3 py-1.5">
                    <CheckCircle2 size={14} color="#9CA3AF" />
                    <Text className="mr-1.5 text-sm text-[#9CA3AF]">{status}</Text>
                </View>
            </View>

            <View className="gap-4">
                <View className="flex-row-reverse items-center self-end">
                    <Calendar size={20} color="#9CA3AF" />
                    <Text className="mr-3 text-right text-base text-[#9CA3AF]">{date}</Text>
                </View>
                <View className="flex-row-reverse items-center self-end">
                    <Clock3 size={20} color="#9CA3AF" />
                    <Text className="mr-3 text-right text-base text-[#9CA3AF]">{time}</Text>
                </View>
                <View className="flex-row-reverse items-center self-end">
                    <DollarSign size={20} color="#9CA3AF" />
                    <Text className="mr-3 text-right text-lg font-semibold text-[#9CA3AF]">₪{price}</Text>
                </View>
            </View>
        </GlassCard>
    );
}
