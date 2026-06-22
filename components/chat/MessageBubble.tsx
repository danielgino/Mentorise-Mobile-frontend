import React from "react";
import { Text, View } from "react-native";
import { Check, CheckCheck } from "lucide-react-native";
import { BubbleShell } from "@/components/chat/BubbleShell";

export type MessageBubbleProps = {
    type: "incoming" | "outgoing";
    content: string;
    timestamp?: string;
    status?: "sending" | "delivered" | "read";
};

export function MessageBubble({
    type,
    content,
    timestamp = "",
    status,
}: MessageBubbleProps) {
    const isOutgoing = type === "outgoing";

    const statusIcon =
        isOutgoing && status ? (
            <View className="opacity-85 ml-1.5">
                {status === "read" ? (
                    <CheckCheck size={14} color="#2E86DE" />
                ) : status === "delivered" ? (
                    <CheckCheck size={14} color="rgba(255,255,255,0.40)" />
                ) : (
                    <Check size={14} color="rgba(255,255,255,0.40)" />
                )}
            </View>
        ) : null;

    return (
        <BubbleShell
            direction={type}
            timestamp={timestamp}
            borderRadius={20}
            metaSlot={statusIcon}
        >
            <View className="px-4 py-3">
                <Text
                    className={`text-[15px] leading-[22px] text-right ${isOutgoing ? "text-white" : "text-[#1A1A2E]"}`}
                    style={{ writingDirection: "rtl" }}
                >
                    {content}
                </Text>
            </View>
        </BubbleShell>
    );
}
