import React, { memo, ReactNode, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { GRADIENT_COLORS_PRIMARY } from "@/constants/theme";

type ChipProps = {
    label: string;
    variant?: "course" | "preference" | "status" | "removable";
    // course
    selected?: boolean;
    disabled?: boolean;
    onPress?: () => void;
    // preference
    icon?: string | ReactNode;
    // status
    statusVariant?: "student" | "graduate" | "mentor";
    // removable
    onRemove?: () => void;
};

function ChipComponent({
    label,
    variant = "course",
    selected = false,
    disabled = false,
    onPress,
    icon,
    statusVariant = "student",
    onRemove,
}: ChipProps) {
    const [pressed, setPressed] = useState(false);

    if (variant === "course") {
        if (selected) {
            return (
                <Pressable
                    onPress={onPress}
                    disabled={disabled}
                    onPressIn={() => setPressed(true)}
                    onPressOut={() => setPressed(false)}
                    className={[
                        "self-start rounded-full overflow-hidden",
                        pressed && !disabled ? "opacity-95" : "",
                        disabled ? "opacity-50" : "",
                    ].join(" ")}
                    accessibilityRole="button"
                    accessibilityState={{ selected: true, disabled }}
                >
                    <LinearGradient
                        colors={GRADIENT_COLORS_PRIMARY}
                        start={{ x: 1, y: 0.5 }}
                        end={{ x: 0, y: 0.5 }}
                        style={{ borderRadius: 999 }}
                    >
                        <View className="px-4 py-2 items-center justify-center">
                            <Text className="text-sm text-white text-right" numberOfLines={1}>
                                {label}
                            </Text>
                        </View>
                    </LinearGradient>
                </Pressable>
            );
        }

        return (
            <Pressable
                onPress={onPress}
                disabled={disabled}
                onPressIn={() => setPressed(true)}
                onPressOut={() => setPressed(false)}
                className={[
                    "self-start rounded-full px-4 py-2 border border-[#E5E7EB]",
                    pressed && !disabled ? "bg-[#E8F0FF]" : "bg-[#F0F4FF]",
                    disabled ? "opacity-50" : "",
                ].join(" ")}
                accessibilityRole="button"
                accessibilityState={{ selected: false, disabled }}
            >
                <Text className="text-sm text-[#6B7280] text-right" numberOfLines={1}>
                    {label}
                </Text>
            </Pressable>
        );
    }

    if (variant === "preference") {
        return (
            <Pressable
                onPress={onPress}
                disabled={disabled || !onPress}
                className={[
                    "self-start flex-row items-center gap-2 rounded-full px-3 py-1.5",
                    "border border-[#E5E7EB] bg-[#F0F4FF]",
                    !disabled && onPress ? "active:bg-[#E8F0FF]" : "",
                    disabled ? "opacity-60" : "",
                ].join(" ")}
                accessibilityRole={onPress ? "button" : undefined}
                accessibilityLabel={label}
            >
                {icon ? (
                    typeof icon === "string" ? (
                        <Text className="text-sm">{icon}</Text>
                    ) : (
                        <View>{icon}</View>
                    )
                ) : null}
                <Text className="text-sm text-[#6B7280]">{label}</Text>
            </Pressable>
        );
    }

    if (variant === "status") {
        const statusColors: Record<"student" | "graduate" | "mentor", { bg: string; text: string }> = {
            student: { bg: "#EFF6FF", text: "#2E86DE" },
            graduate: { bg: "#F0F4FF", text: "#A66CFF" },
            mentor: { bg: "#F0FFFE", text: "#1D9E75" },
        };
        const { bg, text } = statusColors[statusVariant];
        return (
            <View
                className="self-start rounded-full px-4 py-2"
                style={{ backgroundColor: bg, borderWidth: 1, borderColor: `${text}30` }}
            >
                <Text className="text-sm font-semibold" style={{ color: text }}>{label}</Text>
            </View>
        );
    }

    // removable
    return (
        <View className="flex-row-reverse items-center gap-2 bg-white border border-[#E5E7EB] rounded-full px-3 py-2">
            <Text className="text-sm text-[#111827]">{label}</Text>
            <Pressable onPress={onRemove}>
                <Ionicons name="close" size={16} color="#6B7280" />
            </Pressable>
        </View>
    );
}

export const Chip = memo(ChipComponent);
