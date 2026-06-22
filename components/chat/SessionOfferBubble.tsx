import React from "react";
import { Pressable, Text, View } from "react-native";
import { CalendarDays } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BubbleShell } from "@/components/chat/BubbleShell";
import { GRADIENT_COLORS_PRIMARY } from "@/constants/theme";

type SessionOfferBubbleProps = {
    type: "incoming" | "outgoing";
    content: string;
    timestamp?: string;
    onPressOpenLessons: () => void;
};

export function SessionOfferBubble({
    type,
    content,
    timestamp = "",
    onPressOpenLessons,
}: SessionOfferBubbleProps) {
    const isOutgoing = type === "outgoing";

    return (
        <BubbleShell
            direction={type}
            timestamp={timestamp}
            borderRadius={24}
            maxWidth="82%"
            overflow
        >
            <View style={{ padding: 16 }}>
                <View className="flex-row-reverse items-center mb-3">
                    <View
                        className="h-10 w-10 items-center justify-center rounded-full"
                        style={{
                            borderWidth: 1,
                            borderColor: isOutgoing ? "rgba(255,255,255,0.25)" : "rgba(46,134,222,0.20)",
                            backgroundColor: isOutgoing ? "rgba(255,255,255,0.15)" : "rgba(46,134,222,0.10)",
                        }}
                    >
                        <CalendarDays size={18} color={isOutgoing ? "#FFFFFF" : "#2E86DE"} />
                    </View>

                    <View className="mr-3 flex-1 items-end">
                        <Text
                            className="text-[15px] font-semibold"
                            style={{ color: isOutgoing ? "#FFFFFF" : "#1A1A2E" }}
                        >
                            הצעת שיעור
                        </Text>
                    </View>
                </View>

                <View
                    className="rounded-[18px] px-4 py-3"
                    style={{
                        borderWidth: 1,
                        borderColor: isOutgoing ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.07)",
                        backgroundColor: isOutgoing ? "rgba(0,0,0,0.12)" : "#F8F9FC",
                    }}
                >
                    <Text
                        className="text-[15px] leading-[22px] text-right"
                        style={{ writingDirection: "rtl", color: isOutgoing ? "#FFFFFF" : "#1A1A2E" }}
                    >
                        {content}
                    </Text>
                    <Text
                        className="text-right text-[12px] leading-[18px] text-[#A66CFF]"
                        style={{ writingDirection: "rtl", flexShrink: 1 }}
                    >
                        *הצעות שיעור תקפות ל־3 שעות לאישור מרגע שליחת ההצעה
                    </Text>
                </View>

                <Pressable
                    onPress={onPressOpenLessons}
                    className="mt-4 self-end overflow-hidden rounded-full"
                    style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                >
                    <LinearGradient
                        colors={GRADIENT_COLORS_PRIMARY}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            borderRadius: 999,
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                        }}
                    >
                        <Text className="text-white text-sm font-medium">
                            מעבר לשיעורים שלי
                        </Text>
                    </LinearGradient>
                </Pressable>
            </View>
        </BubbleShell>
    );
}
