import React, {useCallback, useEffect} from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
    FadeIn,
    FadeOut,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Loader } from "lucide-react-native";

import { getSwipeTutors } from "@/api/tutorsSwipeApi";
import {useSwipeStore} from "@/store/swipeStore.ts";

export default function FindingScreen() {
    const router = useRouter();
    const setInitial = useSwipeStore((s) => s.setInitial);

    const [error, setError] = React.useState<string | null>(null);

    const load = useCallback(async () => {
        setError(null);

        try {
            // מביאים את הבאטץ' הראשון כדי ש-Swipe יעלה ישר עם כרטיסים
            const resp: any = await getSwipeTutors({
                limit: 10,
                cursor: null,
                excludeIds: [],
            });

            const items = resp.items ?? [];

            if (items.length === 0) {
                setError("כרגע אין מתרגלים זמינים. נסה שוב עוד מעט.");
                return;
            }

            // שומרים ב-store עבור מסך ה-swipe
            setInitial(items, resp.nextCursor ?? null, resp.hasMore);

            // ⚠️ תעדכן לנתיב המדויק של מסך הסווייפ אצלך
            router.replace("/");
        } catch (e: any) {
            setError(e?.message ?? "שגיאה לא ידועה");
        }
    }, [router, setInitial]);

    useEffect(() => {
        load();
    }, [load]);

    // Rotation animation
    const rotation = useSharedValue(0);
   useEffect(() => {
        rotation.value = withRepeat(withTiming(360, { duration: 2000 }), -1, false);
    }, []);

    const rotateStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
        <Animated.View
            entering={FadeIn.duration(250)}
            exiting={FadeOut.duration(200)}
            className="flex-1 items-center justify-center px-6"
        >
            {/* Loader */}
            <Animated.View style={rotateStyle} className="mb-8">
                <View className="relative w-20 h-20 items-center justify-center">
                    {/* Glow */}
                    <LinearGradient
                        colors={[
                            "rgba(64,224,208,0.25)",
                            "rgba(46,134,222,0.25)",
                            "rgba(166,108,255,0.25)",
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            position: "absolute",
                            inset: -12,
                            borderRadius: 999,
                            opacity: 0.6,
                        }}
                    />

                    <Loader size={80} color="#2E86DE" />
                </View>
            </Animated.View>

            {/* Text */}
            <Animated.View entering={FadeIn.delay(300)} className="items-center">
                <Text className="text-xl text-[#1A1A2E] mb-2 text-center">
                    אנחנו מוצאים לך מתרגלים מתאימים…
                </Text>

                {error ? (
                    <>
                        <Text className="text-[#6B7280] text-center mb-4">{error}</Text>

                        <Pressable
                            onPress={load}
                            className="px-5 py-3 rounded-full bg-[#F0F4FF] border border-[#E5E7EB]"
                        >
                            <Text className="text-[#2E86DE]">נסה שוב</Text>
                        </Pressable>
                    </>
                ) : (
                    <Text className="text-[#6B7280] text-center">זה ייקח רק שנייה</Text>
                )}
            </Animated.View>

            {/* Animated dots (רק כשאין שגיאה) */}
            {!error ? (
                <View className="flex-row-reverse gap-2 mt-8">
                    {[0, 1, 2].map((i) => (
                        <AnimatedDot key={i} delay={i * 200} />
                    ))}
                </View>
            ) : null}
        </Animated.View>
    );
}

/* ---------- Animated Dot ---------- */

function AnimatedDot({ delay }: { delay: number }) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.3);

    React.useEffect(() => {
        scale.value = withRepeat(
            withSequence(withTiming(1.5, { duration: 500 }), withTiming(1, { duration: 500 })),
            -1,
            false
        );

        opacity.value = withRepeat(
            withSequence(withTiming(1, { duration: 500 }), withTiming(0.3, { duration: 500 })),
            -1,
            false
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return <Animated.View style={style} className="w-2 h-2 rounded-full bg-[#2E86DE]" />;
}
