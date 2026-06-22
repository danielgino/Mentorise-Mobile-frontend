import React, { useEffect, useRef } from "react";
import { Animated, ImageBackground, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ShimmerPlaceholder } from "@/components/ui/ShimmerPlaceholder";

type TutorCoverImageProps = {
    imageUrl?: string;
    name?: string;
    height?: number;
    rounded?: boolean;
};

export default function TutorCoverImage({
                                            imageUrl,
                                            name,
                                            height = 256,
                                            rounded = true,
                                        }: TutorCoverImageProps) {
    const imgOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        imgOpacity.setValue(0);
    }, [imageUrl]);

    return (
        <View
            style={{ height }}
            className={`relative w-full overflow-hidden bg-[#F0F4FF] ${
                rounded ? "rounded-3xl" : ""
            }`}
        >
            {imageUrl ? (
                <>
                    <ShimmerPlaceholder
                        style={StyleSheet.absoluteFillObject}
                        height={height}
                        borderRadius={rounded ? 24 : 0}
                    />
                    <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: imgOpacity }]}>
                        <ImageBackground
                            source={{ uri: imageUrl }}
                            resizeMode="cover"
                            style={StyleSheet.absoluteFillObject}
                            onLoad={() =>
                                Animated.timing(imgOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start()
                            }
                        >
                            <View className="absolute inset-0 bg-black/25" />
                            <LinearGradient
                                colors={[
                                    "rgba(10,15,35,0.10)",
                                    "rgba(10,15,35,0.20)",
                                    "rgba(10,15,35,0.55)",
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                className="absolute inset-0"
                            />
                        </ImageBackground>
                    </Animated.View>
                </>
            ) : (
                <LinearGradient
                    colors={["#EFF6FF", "#F0F4FF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="absolute inset-0"
                />
            )}

            <View className="absolute bottom-4 left-4 right-4">
                <Text
                    className="text-right text-lg font-bold"
                    style={{ color: imageUrl ? "#FFFFFF" : "#1A1A2E" }}
                >
                    {name ?? "תמונת מתרגל"}
                </Text>
                <Text
                    className="mt-1 text-right text-xs"
                    style={{ color: imageUrl ? "rgba(255,255,255,0.70)" : "#9CA3AF" }}
                >
                    כך התמונה תופיע בפרופיל המתרגל
                </Text>
            </View>
        </View>
    );
}