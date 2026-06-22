import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";

type GlassCardProps = {
    children: ReactNode;
    className?: string;
    innerClassName?: string;
    onPress?: () => void;
    selected?: boolean;
    rounded?: "2xl" | "3xl";
    borderColor?: string;
    borderWidth?: number;
    gradientColors?: readonly [string, string, ...string[]];
    gradientStart?: { x: number; y: number };
    gradientEnd?: { x: number; y: number };
    shadowColor?: string;
    shadowOffset?: { width: number; height: number };
    shadowOpacity?: number;
    shadowRadius?: number;
    elevation?: number;
    accentBar?: boolean;
};

export function GlassCard({
    children,
    className = "",
    innerClassName,
    onPress,
    selected = false,
    rounded = "2xl",
    borderColor = "rgba(0,0,0,0.05)",
    borderWidth = 1,
    gradientColors,
    gradientStart = { x: 0, y: 0 },
    gradientEnd = { x: 1, y: 1 },
    shadowColor = "#1A1A2E",
    shadowOffset = { width: 0, height: 4 },
    shadowOpacity = 0.06,
    shadowRadius = 16,
    elevation = 3,
    accentBar = false,
}: GlassCardProps) {
    const [pressed, setPressed] = useState(false);
    const clickable = Boolean(onPress);
    const roundedClass = rounded === "3xl" ? "rounded-3xl" : "rounded-2xl";
    const hasGradient = Boolean(gradientColors);

    const resolvedInnerClass =
        innerClassName !== undefined
            ? innerClassName
            : rounded === "3xl"
            ? "p-6 rounded-3xl"
            : "p-6 rounded-2xl";

    return (
        <Pressable
            onPress={onPress}
            disabled={!clickable}
            onPressIn={() => clickable && setPressed(true)}
            onPressOut={() => clickable && setPressed(false)}
            className={[
                roundedClass,
                "overflow-hidden",
                clickable ? "active:opacity-95" : "",
                className,
            ].join(" ")}
            style={{
                borderWidth: selected ? 2 : borderWidth,
                borderColor: selected ? "#2E86DE" : borderColor,
                backgroundColor: (pressed && clickable) || selected ? "#F0F4FF" : "#FFFFFF",
                shadowColor,
                shadowOffset,
                shadowOpacity,
                shadowRadius,
                elevation,
            }}
        >
            <View className={resolvedInnerClass}>
                {accentBar && (
                    <View
                        style={{
                            position: "absolute",
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: 3,
                            backgroundColor: "#2E86DE",
                        }}
                    />
                )}
                {hasGradient && gradientColors && (
                    <LinearGradient
                        colors={gradientColors as [string, string, ...string[]]}
                        start={gradientStart}
                        end={gradientEnd}
                        className="absolute inset-0"
                    />
                )}
                {children}
            </View>
        </Pressable>
    );
}
