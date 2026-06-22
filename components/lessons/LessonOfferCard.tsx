import React from "react";
import { Text, View } from "react-native";
import { Calendar, Clock3, DollarSign, FileText } from "lucide-react-native";
import { GlassCard } from "@/components/ui/GlassCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type LessonOfferCardProps = {
    tutorName: string;
    date: string;
    startTime: string;
    endTime: string;
    price: number;
    note?: string;
    status: "pending" | "declined" | "expired";
    onApprove?: () => void;
    onDecline?: () => void;
    showActions?: boolean;
    waitingForStudentApproval?: boolean;
};

export function LessonOfferCard({
    tutorName, date, startTime, endTime, price, note, status,
    onApprove, onDecline, showActions = false, waitingForStudentApproval = false,
}: LessonOfferCardProps) {
    const isPending = status === "pending";
    const isExpired = status === "expired";
    const isDeclined = status === "declined";

    const statusLabel = isPending
        ? waitingForStudentApproval ? "ממתין לאישור הסטודנט" : "ממתין לאישור"
        : isExpired ? "פג תוקף" : "נדחה";

    return (
        <GlassCard
            rounded="3xl"
            className={!isPending ? "opacity-70" : ""}
            borderColor={isPending ? "rgba(46,134,222,0.25)" : "rgba(0,0,0,0.08)"}
            gradientColors={isPending ? ["rgba(46,134,222,0.08)", "rgba(166,108,255,0.04)"] : undefined}
            gradientStart={{ x: 0, y: 0 }}
            gradientEnd={{ x: 1, y: 1 }}
            innerClassName="relative overflow-hidden p-6"
        >
            <View className="relative z-10">
            <View className="mb-5 flex-row-reverse items-start justify-between">
                    <Text className="flex-1 pl-3 text-right text-xl font-semibold text-[#1A1A2E]">{tutorName}</Text>
                    <View
                        className={`rounded-full px-3 py-1.5 ${
                            isPending
                                ? "border border-[#2E86DE]/30 bg-[#F0F4FF]"
                                : isExpired
                                ? "border border-[#A66CFF]/20 bg-[#F0F4FF]"
                                : "border border-[#E5E7EB] bg-[#F8F9FC]"
                        }`}
                    >
                        <Text
                            className={`text-sm font-medium ${
                                isPending ? "text-[#2E86DE]" : isExpired ? "text-[#A66CFF]" : "text-[#9CA3AF]"
                            }`}
                        >
                            {statusLabel}
                        </Text>
                    </View>
                </View>

                <View className="mb-6 gap-4">
                    <View className="flex-row-reverse items-center self-end">
                        <Calendar size={20} color="#2E86DE" />
                        <Text className="mr-3 text-right text-base text-[#6B7280]">{date}</Text>
                    </View>
                    <View className="flex-row-reverse items-center self-end">
                        <Clock3 size={20} color="#2E86DE" />
                        <Text className="mr-3 text-right text-base text-[#6B7280]">{startTime} - {endTime}</Text>
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
                            <Text className="mr-3 flex-1 text-right leading-6 text-base text-[#6B7280]">{note}</Text>
                        </View>
                    ) : null}
                </View>

                {isPending && showActions && (
                    <View className="flex-row-reverse gap-3">
                        <View className="flex-1">
                            <PrimaryButton variant="secondary" onPress={onDecline}>דחה</PrimaryButton>
                        </View>
                        <View className="flex-1">
                            <PrimaryButton variant="gradient" onPress={onApprove}>אשר ושלם</PrimaryButton>
                        </View>
                    </View>
                )}

                {isPending && waitingForStudentApproval && (
                    <View className="rounded-2xl border border-[#E5E7EB] bg-[#F0F4FF] px-5 py-4">
                        <Text className="text-right text-base text-[#6B7280]">
                            ממתין לאישור ותשלום ע"י הסטודנט
                        </Text>
                    </View>
                )}
            </View>
        </GlassCard>
    );
}
