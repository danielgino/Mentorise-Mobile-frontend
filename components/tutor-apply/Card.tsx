import { View } from "react-native";
import type { ReactNode } from "react";

export default function Card({ children }: { children: ReactNode }) {
    return <View className="bg-white rounded-2xl p-4 shadow-sm mb-6">{children}</View>;
}
