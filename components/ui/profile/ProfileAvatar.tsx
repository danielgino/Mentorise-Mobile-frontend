import React, { memo, useEffect, useMemo, useRef } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Camera, User } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GRADIENT_COLORS_PRIMARY } from "@/constants/theme";
import { ShimmerPlaceholder } from "@/components/ui/ShimmerPlaceholder";

type ProfileAvatarProps = {
    imageUrl?: string;
    name: string;
    onEditClick: () => void;
    uploading?: boolean;
};

function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function ProfileAvatarComponent({ imageUrl, name, onEditClick, uploading = false }: ProfileAvatarProps) {
    const initials = useMemo(() => getInitials(name), [name]);
    const hasImage = Boolean(imageUrl);
    const imgOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        imgOpacity.setValue(0);
    }, [imageUrl]);

    return (
        <View className="relative items-center">
            {/* Avatar + Glow wrapper */}
            <View
                className="relative items-center justify-center mb-3"
                style={{ width: 128, height: 128 }}
            >
                {/* Glow (נגזרת של האווטאר) */}
                <LinearGradient
                    colors={GRADIENT_COLORS_PRIMARY}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        position: "absolute",
                        width: 112,
                        height: 112,
                        borderRadius: 999,
                        opacity: 0.25,
                        transform: [{ scale: 1.2 }],
                    }}
                />

                {/* Avatar container */}
                <View style={{ width: 112, height: 112 }}>
                    <LinearGradient
                        colors={GRADIENT_COLORS_PRIMARY}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: 999,
                            padding: 3,
                        }}
                    >
                        <View className="h-full w-full overflow-hidden rounded-full  items-center justify-center">
                            {hasImage ? (
                                <View className="h-full w-full overflow-hidden rounded-full">
                                    <ShimmerPlaceholder height="100%" borderRadius={999} />
                                    <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: imgOpacity }]}>
                                        <Image
                                            source={{ uri: imageUrl }}
                                            accessibilityLabel={name}
                                            style={{ width: "100%", height: "100%" }}
                                            resizeMode="cover"
                                            onLoad={() =>
                                                Animated.timing(imgOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start()
                                            }
                                        />
                                    </Animated.View>
                                </View>
                            ) : (
                                <View>
                                    {initials ? (
                                        <Text
                                            style={{
                                                fontSize: 50,
                                                fontFamily: "Assistant_500Medium",
                                                fontWeight: "500",
                                                letterSpacing: 1,
                                                color: "#FFFFFF",
                                            }}
                                        >
                                            {initials}
                                        </Text>
                                    ) : (
                                        <User size={40} color="rgba(255,255,255,0.85)" />
                                    )}
                                </View>
                            )}
                            {uploading && (
                                <View style={StyleSheet.absoluteFillObject}>
                                    <ShimmerPlaceholder height="100%" borderRadius={999} />
                                </View>
                            )}
                        </View>
                    </LinearGradient>
                </View>

                {/* Edit icon */}
                <Pressable
                    onPress={onEditClick}
                    className="absolute bottom-0 left-0 items-center justify-center active:opacity-90"
                    style={{ width: 36, height: 36, borderRadius: 999 }}
                >
                    <LinearGradient
                        colors={GRADIENT_COLORS_PRIMARY}
                        style={{ width: "100%", height: "100%", borderRadius: 999 }}
                    >
                        <View className="h-full w-full items-center justify-center">
                            <Camera size={16} color="#FFFFFF" />
                        </View>
                    </LinearGradient>
                </Pressable>
            </View>

        </View>
    );
}

export const ProfileAvatar = memo(ProfileAvatarComponent);
