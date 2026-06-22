import React, { useEffect, useRef, useState } from "react";
import { Animated, DimensionValue, LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type ShimmerPlaceholderProps = {
    height: DimensionValue;
    width?: DimensionValue;
    borderRadius?: number;
    baseColor?: string;
    style?: StyleProp<ViewStyle>;
};

export function ShimmerPlaceholder({
    height,
    width = "100%",
    borderRadius = 0,
    baseColor = "#F3F4F6",
    style,
}: ShimmerPlaceholderProps) {
    const [containerWidth, setContainerWidth] = useState(0);
    const translateX = useRef(new Animated.Value(0)).current;
    const animRef = useRef<Animated.CompositeAnimation | null>(null);

    const onLayout = (e: LayoutChangeEvent) => {
        setContainerWidth(e.nativeEvent.layout.width);
    };

    useEffect(() => {
        if (containerWidth <= 0) return;
        translateX.setValue(-containerWidth);
        animRef.current = Animated.loop(
            Animated.timing(translateX, {
                toValue: containerWidth,
                duration: 1500,
                useNativeDriver: true,
            })
        );
        animRef.current.start();
        return () => animRef.current?.stop();
    }, [containerWidth]);

    return (
        <View
            onLayout={onLayout}
            style={[
                { width, height, borderRadius, backgroundColor: baseColor, overflow: "hidden" },
                style,
            ]}
        >
            {containerWidth > 0 && (
                <Animated.View
                    style={[StyleSheet.absoluteFillObject, { transform: [{ translateX }] }]}
                >
                    <LinearGradient
                        colors={["transparent", "rgba(255,255,255,0.82)", "transparent"]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={{ width: containerWidth, height: "100%" }}
                    />
                </Animated.View>
            )}
        </View>
    );
}
