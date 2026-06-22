import React from "react";
import { Pressable, Text, View } from "react-native";
import { Calendar, Clock3, DollarSign, FileText, CheckCircle2, Video } from "lucide-react-native";
import { GlassCard } from "@/components/ui/GlassCard";

interface UpcomingLessonCardProps {
    tutorName: string;
    date: string;
    time: string;
    price: number;
    note?: string;
}

export function UpcomingLessonCard({ tutorName, date, time, price, note }: UpcomingLessonCardProps) {
    return (
        <GlassCard
            rounded="3xl"
            borderColor="rgba(46,134,222,0.30)"
            gradientColors={["rgba(46,134,222,0.10)", "rgba(166,108,255,0.08)"]}
            gradientStart={{ x: 0, y: 0 }}
            gradientEnd={{ x: 1, y: 1 }}
            innerClassName="relative overflow-hidden p-6"
        >
            <View className="relative z-10">
                <View className="mb-5 flex-row-reverse items-start justify-between">
                    <Text className="flex-1 pl-3 text-right text-xl font-semibold text-[#1A1A2E]">
                        {tutorName}
                    </Text>
                    <View className="flex-row-reverse items-center rounded-full border border-[#2E86DE]/30 bg-[#2E86DE]/20 px-3 py-1.5">
                        <CheckCircle2 size={14} color="#2E86DE" />
                        <Text className="mr-1.5 text-sm font-medium text-[#2E86DE]">מאושר</Text>
                    </View>
                </View>

                <View className="mb-6 gap-4">
                    <View className="flex-row-reverse items-center self-end">
                        <Calendar size={20} color="#2E86DE" />
                        <Text className="mr-3 text-right text-base text-[#6B7280]">{date}</Text>
                    </View>
                    <View className="flex-row-reverse items-center self-end">
                        <Clock3 size={20} color="#2E86DE" />
                        <Text className="mr-3 text-right text-base text-[#6B7280]">{time}</Text>
                    </View>
                    <View className="flex-row-reverse items-center self-end">
                        <DollarSign size={20} color="#A66CFF" />
                        <Text className="mr-3 text-right text-lg font-semibold text-[#1A1A2E]">₪{price}</Text>
                    </View>
                    {note ? (
                        <View className="mt-1 flex-row-reverse items-start rounded-2xl border border-[#E5E7EB] bg-[#F8F9FC] p-4">
                            <View className="mt-0.5">
                                <FileText size={18} color="#9CA3AF" />
                            </View>
                            <Text className="mr-3 flex-1 text-right text-base leading-6 text-[#6B7280]">{note}</Text>
                        </View>
                    ) : null}
                </View>

                <Pressable
                    disabled
                    className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F8F9FC] px-5 py-4"
                >
                    <View className="flex-row-reverse items-center justify-center">
                        <Video size={18} color="#9CA3AF" />
                        <Text className="mr-2 text-base text-[#9CA3AF]">הצטרף לשיעור (יפתח בקרוב)</Text>
                    </View>
                </Pressable>
            </View>
        </GlassCard>
    );
}
