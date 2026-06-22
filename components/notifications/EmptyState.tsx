import React from "react";
import { View, Text } from "react-native";
import { BellOff } from "lucide-react-native";

export function EmptyState() {
    return (
        <View className="items-center justify-center px-8 py-20">
            <View className="relative mb-8 items-center justify-center">
                <View className="absolute h-40 w-40 rounded-full bg-[#F0F4FF]" />
                <View className="h-28 w-28 items-center justify-center rounded-full border border-[rgba(46,134,222,0.15)] bg-[#F0F4FF]">
                    <View className="h-20 w-20 items-center justify-center rounded-full bg-white">
                        <BellOff size={40} color="#2E86DE" strokeWidth={1.5} />
                    </View>
                </View>
            </View>

            <Text className="mb-3 text-center text-xl font-bold text-[#1A1A2E]">
                אין התראות כרגע
            </Text>

            <Text className="max-w-[260px] text-center text-base leading-7 text-[#9CA3AF]">
                כאן יופיעו עדכונים חשובים מהמערכת
            </Text>
        </View>
    );
}
