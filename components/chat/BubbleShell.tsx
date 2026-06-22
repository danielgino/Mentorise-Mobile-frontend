import React, { ReactNode } from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GRADIENT_COLORS_PRIMARY } from "@/constants/theme";

type BubbleShellProps = {
    direction: "incoming" | "outgoing";
    timestamp?: string;
    borderColor?: string;
    children: ReactNode;
    /** default "75%" — MessageBubble; SessionOfferBubble uses "82%" */
    maxWidth?: string;
    /** default 20 — MessageBubble; SessionOfferBubble uses 24 */
    borderRadius?: number;
    /** default false — SessionOfferBubble clips its gradient so passes true */
    overflow?: boolean;
    /** extra nodes appended inside the meta row, after the timestamp */
    metaSlot?: ReactNode;
};

export function BubbleShell({
    direction,
    timestamp = "",
    borderColor,
    children,
    maxWidth = "75%",
    borderRadius = 20,
    overflow = false,
    metaSlot,
}: BubbleShellProps) {
    const isOutgoing = direction === "outgoing";

    return (
        <View className={`flex-row-reverse ${isOutgoing ? "justify-start" : "justify-end"} mb-4`}>
            <View
                className={isOutgoing ? "items-start" : "items-end"}
                style={{ maxWidth: maxWidth as any }}
            >
                {isOutgoing ? (
                    <LinearGradient
                        colors={GRADIENT_COLORS_PRIMARY}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={{
                            borderRadius,
                            overflow: overflow ? "hidden" : "visible",
                        }}
                    >
                        {children}
                    </LinearGradient>
                ) : (
                    <View
                        style={{
                            borderRadius,
                            borderWidth: 1,
                            borderColor: borderColor ?? "rgba(0,0,0,0.07)",
                            backgroundColor: "#F0F4FF",
                            overflow: overflow ? "hidden" : "visible",
                        }}
                    >
                        {children}
                    </View>
                )}

                <View className="flex-row-reverse items-center mt-1.5 px-2">
                    {!!timestamp && (
                        <Text className="text-xs text-[#9CA3AF]">{timestamp}</Text>
                    )}
                    {metaSlot}
                </View>
            </View>
        </View>
    );
}
