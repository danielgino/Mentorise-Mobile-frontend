import React from "react";
import { View } from "react-native";

export function MentoBackground({ children }: { children: React.ReactNode }) {
    return (
        <View style={{ flex: 1, backgroundColor: "#F8F9FC" }}>
            {children}
        </View>
    );
}
