import React, {useEffect, useMemo, useState} from "react";
import {View, Text, Alert, Pressable} from "react-native";
import { useRouter, useGlobalSearchParams } from "expo-router";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Layers, Target, Sparkles, ArrowRight, Clock } from "lucide-react-native";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GlassCard } from "@/components/ui/GlassCard";
import {upsertLearningPreferences} from "@/api/learningPreferencesApi";
import {useAuth} from "@/hooks/AuthProvider";
import {ROUTES} from "@/constants/routes";

type LearningType = "major" | "course" | "year" | "later" | "";

export default function PracticeTypeScreen() {
    const router = useRouter();
    const params = useGlobalSearchParams();
    const mode = (params.mode as string) || "signup";
    const [selected, setSelected] = useState<LearningType>("");
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const canContinue = useMemo(() => selected !== "" && !loading, [selected, loading]);

    const saveMajor = async () => {
        setLoading(true);
        try {
            await upsertLearningPreferences({
                scopeType: "MAJOR",
            });

            if (mode === "signup") {
                router.push({ pathname: ROUTES.ONBOARDING.FINDING, params: { mode: "signup" } });
            } else {
                router.replace("/(tabs)");
            }
        } catch (e: any) {
            if (__DEV__) console.warn("❌ save prefs failed", e);
            Alert.alert("שגיאה", e?.message || "שמירת העדפות נכשלה");
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = async () => {
        if (!selected || loading) return;
        if (selected === "course") {
            router.push({ pathname: "/(onboarding)/course-select", params: { mode } });
            return;
        }
        if (selected === "year") {
            router.push({ pathname: "/(onboarding)/year-select", params: { mode } });
            return;
        }
        if (selected === "later") {
            router.push("/(tabs)");
            return;
        }
        await saveMajor();
    };
    return (
        <Animated.View
            entering={FadeInRight.duration(220)}
            exiting={FadeOutLeft.duration(220)}
            className="flex-1 px-6 py-12"
        >

            {/* Back arrow — edit mode only */}
            {mode === "edit" && (
                <View className="mb-4 items-end">
                    <Pressable
                        onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}
                        className="h-11 w-11 items-center justify-center rounded-full overflow-hidden bg-white"
                        style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.12)" }}
                    >
                        <ArrowRight size={20} color="#1A1A2E" />
                    </Pressable>
                </View>
            )}

            {/* Question */}
            <View className="items-center mb-8">
                <Text className="text-2xl text-[#1A1A2E] text-center">
                    איזה סוג תרגול אתה מחפש כרגע?
                </Text>
            </View>

            {/* Options */}
            <View className="flex-1 gap-4 mb-4">
                <GlassCard selected={selected === "major"} onPress={() => setSelected("major")}>
                    <View className="flex-row-reverse items-center gap-4">
                        <LinearGradient
                            colors={["rgba(46,134,222,0.12)", "rgba(46,134,222,0.06)"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ width: 56, height: 56, borderRadius: 999 }}
                        >
                            <View className="flex-1 items-center justify-center">
                                <Layers size={28} color="#2E86DE" />
                            </View>
                        </LinearGradient>

                        <View className="flex-1">
                            <Text className="text-lg text-[#1A1A2E] text-right">תרגול כללי במסלול שלי</Text>
                        </View>
                    </View>
                </GlassCard>

                <GlassCard selected={selected === "course"} onPress={() => setSelected("course")}>
                    <View className="flex-row-reverse items-center gap-4">
                        <LinearGradient
                            colors={["rgba(46,134,222,0.10)", "rgba(166,108,255,0.10)"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ width: 56, height: 56, borderRadius: 999 }}
                        >
                            <View className="flex-1 items-center justify-center">
                                <Target size={28} color="#2E86DE" />
                            </View>
                        </LinearGradient>

                        <View className="flex-1">
                            <Text className="text-lg text-[#1A1A2E] text-right">תרגול לקורסים מסוימים</Text>
                        </View>
                    </View>
                </GlassCard>

                <GlassCard selected={selected === "year"} onPress={() => setSelected("year")}>
                    <View className="flex-row-reverse items-center gap-4">
                        <LinearGradient
                            colors={["rgba(166,108,255,0.10)", "rgba(46,134,222,0.10)"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ width: 56, height: 56, borderRadius: 999 }}
                        >
                            <View className="flex-1 items-center justify-center">
                                <Sparkles size={28} color="#A66CFF" />
                            </View>
                        </LinearGradient>

                        <View className="flex-1">
                            <Text className="text-lg text-[#1A1A2E] text-right"> תרגול לפי שנים ספציפיות</Text>
                        </View>
                    </View>
                </GlassCard>

                <GlassCard selected={selected === "later"} onPress={() => setSelected("later")}>
                    <View className="flex-row-reverse items-center gap-4">
                        <LinearGradient
                            colors={["rgba(166,108,255,0.10)", "rgba(46,134,222,0.10)"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ width: 56, height: 56, borderRadius: 999 }}
                        >
                            <View className="flex-1 items-center justify-center">
                                <Clock size={28} color="#A66CFF" />
                            </View>
                        </LinearGradient>

                        <View className="flex-1">
                            <Text className="text-lg text-[#1A1A2E] text-right"> אבחר בהמשך</Text>
                        </View>
                    </View>
                </GlassCard>
            </View>

            {/* Helper */}
            <Text className="text-[#9CA3AF] text-sm text-center mb-8">
                אפשר לשנות את זה בכל רגע
            </Text>

            {/* Continue */}
            <PrimaryButton onPress={handleContinue} disabled={!canContinue}>
                המשך להתאמה
            </PrimaryButton>
        </Animated.View>
    );
}
