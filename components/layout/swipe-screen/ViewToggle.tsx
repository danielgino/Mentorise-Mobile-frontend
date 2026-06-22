import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from "react-native-reanimated";

export type ViewMode = "swipe" | "list";

type ViewToggleProps = {
    value: ViewMode;
    onChange: (mode: ViewMode) => void;
};

const PILL_W = 112;
const PILL_H = 36;
const PAD = 3;
const TIMING = { duration: 220, easing: Easing.out(Easing.cubic) };

export function ViewToggle({ value, onChange }: ViewToggleProps) {
    const translateX = useSharedValue(value === "swipe" ? 0 : PILL_W);

    useEffect(() => {
        translateX.value = withTiming(value === "swipe" ? 0 : PILL_W, TIMING);
    }, [value]);

    const pillStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View
            style={{
                flexDirection: "row",
                alignSelf: "center",
                backgroundColor: "#F0F4FF",
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.07)",
                padding: PAD,
                overflow: "hidden",
            }}
        >
            {/* Sliding gradient pill — sits behind the labels */}
            <Animated.View
                style={[
                    {
                        position: "absolute",
                        top: PAD,
                        left: PAD,
                        width: PILL_W,
                        height: PILL_H,
                        borderRadius: 999,
                        overflow: "hidden",
                    },
                    pillStyle,
                ]}
            >
                <LinearGradient
                    colors={["#2E86DE", "#A66CFF"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={{ flex: 1 }}
                />
            </Animated.View>

            {/* גלילה — left */}
            <Pressable
                onPress={() => onChange("swipe")}
                style={{
                    width: PILL_W,
                    height: PILL_H,
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1,
                }}
            >
                <Text
                    style={{
                        fontSize: 14,
                        color: value === "swipe" ? "#FFFFFF" : "#9CA3AF",
                        fontFamily: value === "swipe" ? "Assistant_700Bold" : "Assistant_400Regular",
                        fontWeight: value === "swipe" ? "700" : "400",
                    }}
                >
                    גלילה
                </Text>
            </Pressable>

            {/* רשימה — right */}
            <Pressable
                onPress={() => onChange("list")}
                style={{
                    width: PILL_W,
                    height: PILL_H,
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1,
                }}
            >
                <Text
                    style={{
                        fontSize: 14,
                        color: value === "list" ? "#FFFFFF" : "#9CA3AF",
                        fontFamily: value === "list" ? "Assistant_700Bold" : "Assistant_400Regular",
                        fontWeight: value === "list" ? "700" : "400",
                    }}
                >
                    רשימה
                </Text>
            </Pressable>
        </View>
    );
}
