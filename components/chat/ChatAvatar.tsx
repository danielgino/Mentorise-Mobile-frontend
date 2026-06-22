import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GRADIENT_COLORS_PRIMARY, GRADIENT_START, GRADIENT_END } from "@/constants/theme";
import { ShimmerPlaceholder } from "@/components/ui/ShimmerPlaceholder";

type ChatAvatarProps = {
    /** 1–2 uppercase initials shown when no photo is available */
    initials: string;
    /** Remote image URL — omit or leave empty to show the initials fallback */
    avatarUrl?: string;
    /** Diameter in logical pixels. Defaults to 48. */
    size?: number;
};

export function ChatAvatar({ initials, avatarUrl, size = 48 }: ChatAvatarProps) {
    const [imageFailed, setImageFailed] = useState(false);
    const hasImage = !!avatarUrl?.trim() && !imageFailed;
    const imgOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        imgOpacity.setValue(0);
    }, [avatarUrl]);

    const circleStyle = { width: size, height: size, borderRadius: size / 2 };

    if (hasImage) {
        // Gradient border ring → white inner circle → real photo
        return (
            <LinearGradient
                colors={GRADIENT_COLORS_PRIMARY}
                start={GRADIENT_START}
                end={GRADIENT_END}
                style={[styles.ring, circleStyle]}
            >
                <View style={styles.imageInner}>
                    <ShimmerPlaceholder height="100%" borderRadius={size / 2} />
                    <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: imgOpacity }]}>
                        <Image
                            source={{ uri: avatarUrl! }}
                            style={styles.imageFill}
                            resizeMode="cover"
                            onError={() => setImageFailed(true)}
                            onLoad={() =>
                                Animated.timing(imgOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start()
                            }
                        />
                    </Animated.View>
                </View>
            </LinearGradient>
        );
    }

    // Gradient ring → white separator → gradient fill → white initials
    return (
        <LinearGradient
            colors={GRADIENT_COLORS_PRIMARY}
            start={GRADIENT_START}
            end={GRADIENT_END}
            style={[styles.ring, circleStyle]}
        >
            <View style={styles.whiteSeparator}>
                <LinearGradient
                    colors={GRADIENT_COLORS_PRIMARY}
                    start={GRADIENT_START}
                    end={GRADIENT_END}
                    style={styles.initialsInnerGradient}
                >
                    <View style={styles.initialsOverlay}>
                        <Text style={[styles.initialsText, { fontSize: Math.round(size * 0.36) }]}>
                            {initials}
                        </Text>
                    </View>
                </LinearGradient>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    ring: {
        padding: 2.5,
        overflow: "hidden",
    },
    imageInner: {
        flex: 1,
        borderRadius: 999,
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
    },
    imageFill: {
        width: "100%",
        height: "100%",
    },
    whiteSeparator: {
        flex: 1,
        borderRadius: 999,
        backgroundColor: "#FFFFFF",
        padding: 1.5,
        overflow: "hidden",
    },
    initialsInnerGradient: {
        flex: 1,
        borderRadius: 999,
        overflow: "hidden",
    },
    initialsOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
    },
    initialsText: {
        color: "#FFFFFF",
        fontFamily: "Assistant_700Bold",
        fontWeight: "700",
        letterSpacing: 0.5,
    },
});
