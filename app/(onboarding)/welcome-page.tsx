import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeOutLeft, ZoomIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import {GraduationCap, Sparkles} from "lucide-react-native";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {ROUTES} from "@/constants/routes";
import {LogoHeader} from "@/components/ui/LogoHeader";

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <Animated.View
            entering={FadeIn.duration(250)}
            exiting={FadeOutLeft.duration(220)}
            className="flex-1 items-center justify-center px-6"
        >
            {/* Logo Block */}
            <LogoHeader/>

            {/* Headline */}
            <Animated.View entering={FadeIn.duration(260).delay(400)} className="items-center mb-4">
                <Text className="text-3xl text-[#1A1A2E] mb-3 text-center">
                    מוצאים מתרגל שמתאים בדיוק לך
                </Text>
                <Text className="text-[#6B7280] text-lg text-center">
                    בלי חיפושים. בלי בלגן. התאמה חכמה
                </Text>
            </Animated.View>

            {/* Decorative Pulse */}
            <Animated.View entering={ZoomIn.duration(260).delay(600)} className="my-12">
                <View className="w-32 h-32 items-center justify-center">
                    <LinearGradient
                        colors={[
                            "rgba(64,224,208,0.20)",
                            "rgba(46,134,222,0.20)",
                            "rgba(166,108,255,0.25)",
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        // שים לב: style חייב כי LinearGradient לא תומך className ל-size/radius בכל גרסאות Expo
                        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, borderRadius: 9999, opacity: 0.9 }}
                        pointerEvents="none"
                    />

                    {/* האייקון מעל הרקע */}
                    <GraduationCap
                        size={56}
                        color="#A66CFF"
                        style={{
                            zIndex: 1,
                            shadowColor: "#A66CFF",
                            shadowOpacity: 0.9,
                            shadowRadius: 12,
                            shadowOffset: { width: 0, height: 0 },
                            elevation: 15, // לאנדרואיד
                        }}
                    />
                </View>
            </Animated.View>

            {/* CTA */}
            <Animated.View entering={FadeIn.duration(260).delay(800)} className="w-full max-w-sm">
                <PrimaryButton className="mb-4"  onPress={() => router.push(ROUTES.AUTH.LOGIN)}>
                    התחבר
                </PrimaryButton>

                <PrimaryButton onPress={() => router.push(ROUTES.ONBOARDING.REGISTER)}>
                    הירשם
                </PrimaryButton>
            </Animated.View>
        </Animated.View>
    );
}
