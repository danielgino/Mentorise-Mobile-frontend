import React, { useState } from "react";
import { Pressable, Text, View, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GRADIENT_COLORS_PRIMARY } from "@/constants/theme";

type PrimaryButtonProps = {
    children: React.ReactNode;
    onPress?: () => void;
    variant?: "gradient" | "secondary" | "solid";
    fullWidth?: boolean;
    className?: string;
    textClassName?: string;
    disabled?: boolean;
    loading?: boolean;
};

export function PrimaryButton({
    children,
    onPress,
    variant = "gradient",
    fullWidth = true,
    className = "",
    textClassName = "",
    disabled = false,
    loading = false,
}: PrimaryButtonProps) {
    const [pressed, setPressed] = useState(false);
    const isDisabled = disabled || loading;

    if (variant === "gradient" && fullWidth) {
        return (
            <Pressable
                onPress={onPress}
                disabled={isDisabled}
                onPressIn={() => setPressed(true)}
                onPressOut={() => setPressed(false)}
                className={[
                    "w-full rounded-lg overflow-hidden",
                    pressed && !isDisabled ? "opacity-90" : "",
                    isDisabled ? "opacity-50" : "",
                    className,
                ].join(" ")}
                accessibilityRole="button"
                accessibilityState={{ disabled: isDisabled }}
            >
                <LinearGradient
                    colors={GRADIENT_COLORS_PRIMARY}
                    start={{ x: 1, y: 0.5 }}
                    end={{ x: 0, y: 0.5 }}
                    style={{ borderRadius: 8 }}
                >
                    <View className="py-4 px-6 items-center justify-center">
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text className={["text-white text-base font-medium text-center", textClassName].join(" ")}>
                                {children}
                            </Text>
                        )}
                    </View>
                </LinearGradient>
            </Pressable>
        );
    }

    if (variant === "gradient" && !fullWidth) {
        return (
            <Pressable
                onPress={onPress}
                disabled={isDisabled}
                className={[isDisabled ? "opacity-70" : "opacity-100", className].join(" ")}
            >
                <LinearGradient
                    colors={GRADIENT_COLORS_PRIMARY}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={{ borderRadius: 9999, paddingVertical: 14, alignItems: "center" }}
                >
                    {loading ? (
                        <ActivityIndicator />
                    ) : (
                        <Text className={["text-white font-bold", textClassName].join(" ")}>
                            {children}
                        </Text>
                    )}
                </LinearGradient>
            </Pressable>
        );
    }

    if (variant === "secondary") {
        return (
            <Pressable
                onPress={onPress}
                disabled={isDisabled}
                onPressIn={() => setPressed(true)}
                onPressOut={() => setPressed(false)}
                className={[
                    "w-full py-4 px-6 rounded-lg items-center justify-center",
                    pressed && !isDisabled ? "bg-[#E8F0FF]" : "bg-[#F0F4FF]",
                    isDisabled ? "opacity-50" : "",
                    className,
                ].join(" ")}
                accessibilityRole="button"
                accessibilityState={{ disabled: isDisabled }}
            >
                {loading ? (
                    <ActivityIndicator color="#2E86DE" />
                ) : (
                    <Text className={["text-[#2E86DE] text-base font-medium text-center", textClassName].join(" ")}>
                        {children}
                    </Text>
                )}
            </Pressable>
        );
    }

    // solid (blue)
    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            className={[
                "px-5 py-3 rounded-lg items-center justify-center bg-[#2E86DE]",
                isDisabled ? "opacity-50" : "opacity-100",
                className,
            ].filter(Boolean).join(" ")}
            accessibilityRole="button"
        >
            {loading ? (
                <ActivityIndicator color="#FFFFFF" />
            ) : (
                <Text className={["text-white font-bold text-base", textClassName].join(" ")}>
                    {children}
                </Text>
            )}
        </Pressable>
    );
}

export default PrimaryButton;
