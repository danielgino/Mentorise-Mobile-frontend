import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LucideIcon } from "lucide-react-native";
import { GlassCard } from "@/components/ui/GlassCard";

interface NotificationCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    timestamp: string;
    isUnread?: boolean;
    iconColor?: string;
}

export function NotificationCard({
    icon: Icon,
    title,
    description,
    timestamp,
    isUnread = false,
    iconColor = "#40E0D0",
}: NotificationCardProps) {
    return (
        <View className="relative">
            {/* Unread glow dot — outside the card */}
            {isUnread && (
                <View
                    className="absolute right-0 top-0 z-10"
                    style={{ transform: [{ translateX: 5 }, { translateY: -5 }] }}
                >
                    <View className="h-4 w-4 rounded-full bg-[#2E86DE]" />
                    <View
                        className="absolute inset-0 h-4 w-4 rounded-full bg-[#2E86DE] opacity-30"
                        style={{ transform: [{ scale: 1.8 }] }}
                    />
                </View>
            )}

            <GlassCard
                rounded="3xl"
                borderColor={isUnread ? "rgba(46,134,222,0.25)" : "rgba(0,0,0,0.07)"}
                gradientColors={
                    isUnread
                        ? ["rgba(46,134,222,0.06)", "transparent"]
                        : undefined
                }
                gradientStart={{ x: 0, y: 0 }}
                gradientEnd={{ x: 1, y: 1 }}
                innerClassName="relative overflow-hidden"
            >
                {/* Left accent bar for unread */}
                {isUnread && (
                    <LinearGradient
                        colors={["#2E86DE", "#A66CFF"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            borderTopLeftRadius: 24,
                            borderBottomLeftRadius: 24,
                        }}
                    />
                )}

                <View className="p-5">
                    {/* Top row: timestamp left, icon + title right */}
                    <View className="mb-3 flex-row items-start justify-between">
                        <Text className="mt-1 text-sm text-[#9CA3AF]">{timestamp}</Text>

                        <View className="flex-row-reverse items-center gap-3 flex-1 ml-4">
                            <View className="h-14 w-14 shrink-0 items-center justify-center">
                                <Icon size={26} color={iconColor} strokeWidth={1.8} />
                            </View>
                            <Text
                                className="flex-1 text-right text-lg font-bold text-[#1A1A2E]"
                                numberOfLines={2}
                            >
                                {title}
                            </Text>
                        </View>
                    </View>

                    {/* Description */}
                    <Text className="mb-1 text-right text-base leading-7 text-[#1A1A2E]">
                        {description}
                    </Text>
                </View>
            </GlassCard>
        </View>
    );
}
