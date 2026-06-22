// YearSelectScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import Animated, { FadeInRight, FadeOutLeft, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, BookOpen, GraduationCap } from "lucide-react-native";
import { useGlobalSearchParams } from "expo-router";

import { GlassCard } from "@/components/ui/GlassCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useAuth } from "@/hooks/AuthProvider";
import { apiClient } from "@/api/apiClient";
import {upsertLearningPreferences} from "@/api/learningPreferencesApi";
import {router} from "expo-router";

type YearDto = { id: number; name: string; courseCount: number };

export default function YearSelectScreen() {
    const params = useGlobalSearchParams();
    const mode = (params.mode as string) || "signup";
    const { user } = useAuth();
    const majorId = user?.majorId;

    const [years, setYears] = useState<YearDto[]>([]);
    const [selected, setSelected] = useState<number | null>(null);
    const canContinue = useMemo(() => selected != null, [selected]);

    useEffect(() => {
        if (!majorId) return;
        (async () => {
            try {
                const { data } = await apiClient.get<YearDto[]>(`/api/users/major/${majorId}/years`);
                setYears(data);
            } catch (e) {
                if (__DEV__) console.warn("❌ failed to load years", e);
            }
        })();
    }, [majorId]);

    const handleContinue = async () => {
        if (!selected) return;
        try {
            await upsertLearningPreferences({
                scopeType: "YEAR",
                years: [selected],
            });

            if (mode === "signup") {
                router.replace({ pathname: "/(onboarding)/finding", params: { mode: "signup" } });
            } else {
                router.replace("/(tabs)");
            }
        } catch (e: any) {
            if (__DEV__) console.warn("❌ failed to save YEAR preference", e?.message || e);
            Alert.alert("שגיאה", "שמירת השנה נכשלה. נסה שוב.");
        }
    };
    return (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} className="flex-1 px-6 py-12">
            <Animated.View entering={FadeInDown.delay(50)} className="mb-4">
                <View className="self-start flex-row items-center gap-2 px-4 py-2 rounded-full border border-[#2E86DE]/20 bg-[#F0F4FF]">
                    <BookOpen size={16} color="#2E86DE" />
                    <Text className="text-[#6B7280] text-sm">בחירת שנת לימודים</Text>
                </View>
            </Animated.View>

            {/* Title */}
            <View className="items-center mb-8">
                <Text className="text-3xl text-[#1A1A2E] mb-2">באיזו שנה אתה לומד?</Text>
                <Text className="text-[#6B7280] text-lg">בחר את שנת הלימודים שלך</Text>
            </View>

            <ScrollView className="flex-1 -mx-2 px-2 mb-8">
                <View className="gap-3">
                    {years.map((year, index) => (
                        <Animated.View key={year.id} entering={FadeInDown.delay(index * 80)} className="active:scale-95">
                            <GlassCard selected={selected === year.id} onPress={() => setSelected(year.id)}>
                                <View className="flex-row items-center gap-4">
                                    <View className="flex-1 items-end">
                                        <Text className="text-xl text-[#1A1A2E] text-right mb-1">{year.name}</Text>

                                        <View className="flex-row items-center gap-2 justify-end">
                                            <GraduationCap size={16} color="#2E86DE" />
                                            <Text className="text-[#2E86DE] text-sm">{year.courseCount} קורסים</Text>
                                        </View>
                                    </View>

                                    <LinearGradient
                                        colors={["rgba(46,134,222,0.12)", "rgba(46,134,222,0.06)"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 9999,
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Calendar size={28} color="#2E86DE" />
                                    </LinearGradient>
                                </View>
                            </GlassCard>
                        </Animated.View>
                    ))}

                    {years.length === 0 && (
                        <Text className="text-[#9CA3AF] text-center mt-12">אין שנים זמינות למסלול</Text>
                    )}
                </View>
            </ScrollView>

            <PrimaryButton onPress={handleContinue} disabled={!canContinue}>
                המשך
            </PrimaryButton>
        </Animated.View>
    );
}
