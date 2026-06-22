import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { MessageCircle, User, ArrowRight } from "lucide-react-native";

import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { GlassCard } from "../../components/ui/GlassCard";
import { getOrCreateConversation } from "@/api/chatApi";

type Tutor = {
    id: number;
    name: string;
    field: string;
    courses: string[];
};

function getSingleParam(value: string | string[] | undefined) {
    if (Array.isArray(value)) return value[0];
    return value;
}

export default function MatchScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [creatingChat, setCreatingChat] = useState(false);

    const tutor = useMemo<Tutor | null>(() => {
        const idRaw = getSingleParam(params.id);
        const name = getSingleParam(params.name)?.trim() ?? "";
        const field = getSingleParam(params.field)?.trim() ?? "";
        const coursesRaw = getSingleParam(params.courses);

        const id = Number(idRaw);
        const courses =
            coursesRaw
                ?.split(",")
                .map((course) => course.trim())
                .filter(Boolean) ?? [];

        if (!id || Number.isNaN(id)) {
            return null;
        }

        return {
            id,
            name,
            field,
            courses,
        };
    }, [params]);

    const onSendMessage = async () => {
        if (!tutor?.id || creatingChat) return;

        try {
            setCreatingChat(true);

            const result = await getOrCreateConversation(tutor.id);

            router.push({
                pathname: "/chat/[id]",
                params: {
                    id: String(result.conversationId),
                    otherUserId: String(tutor.id),
                    otherUserName: tutor.name,
                },
            });
        } catch (error) {
            if (__DEV__) console.warn("Failed to create or get conversation", error);
            Alert.alert("שגיאה", "לא הצלחנו לפתוח את השיחה כרגע");
        } finally {
            setCreatingChat(false);
        }
    };

    const onViewProfile = () => {
        if (!tutor?.id) return;

        router.push({
            pathname: "/tutor/[id]",
            params: { id: String(tutor.id) },
        });
    };

    const onContinue = () => {
        router.back();
    };

    if (!tutor) {
        return (
            <View className="flex-1 items-center justify-center px-6">
                <Text className="text-[#1A1A2E] text-center text-lg">לא התקבלו פרטי מתרגל</Text>

                <Pressable onPress={() => router.back()} className="mt-4 py-3 px-5 rounded-full border border-[#E5E7EB] bg-[#F0F4FF]">
                    <Text className="text-[#2E86DE]">חזרה</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <Animated.View
            entering={FadeIn.duration(220)}
            exiting={FadeOut.duration(180)}
            className="flex-1 items-center justify-center px-6"
        >
            <Animated.View entering={ZoomIn.springify().damping(14).delay(200)} className="mb-8">
                <Text className="text-7xl">🎉</Text>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(400)} className="items-center mb-8">
                <Text className="text-3xl text-[#1A1A2E] mb-2 text-center">בחירה טובה!</Text>
                <Text className="text-[#6B7280] text-center"> שמחים שמצאת התאמה שלח הודעה ל-{tutor.name} </Text>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(600)} className="mb-12 w-full max-w-sm">
                <GlassCard>
                    <View className="items-center">
                        <LinearGradient
                            colors={["rgba(46,134,222,0.12)", "rgba(166,108,255,0.12)"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ width: 96, height: 96, borderRadius: 999 }}
                        >
                            <View className="flex-1 items-center justify-center">
                                <User size={48} color="#6B7280" />
                            </View>
                        </LinearGradient>

                        <Text className="text-xl text-[#1A1A2E] mt-4 mb-2 text-center">{tutor.name}</Text>

                        {!!tutor.field && (
                            <Text className="text-[#6B7280] mb-3 text-center">{tutor.field}</Text>
                        )}

                        {!!tutor.courses.length && (
                            <View className="flex-row flex-wrap gap-2 justify-center">
                                {tutor.courses.map((course, idx) => (
                                    <View
                                        key={`${course}-${idx}`}
                                        className="px-3 py-1 rounded-full border border-[#E5E7EB] bg-[#F0F4FF]"
                                    >
                                        <Text className="text-[#2E86DE] text-sm">{course}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </GlassCard>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(800)} className="w-full max-w-sm gap-3">
                <PrimaryButton onPress={onSendMessage}>
                    <View className="flex-row-reverse items-center justify-center gap-2">
                        {creatingChat ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <MessageCircle size={20} color="#FFFFFF" />
                        )}
                        <Text className="text-white text-base font-medium">
                            {creatingChat ? "פותח שיחה..." : "שלח הודעה"}
                        </Text>
                    </View>
                </PrimaryButton>

                <PrimaryButton variant="secondary" onPress={onViewProfile}>
                    <View className="flex-row-reverse items-center justify-center gap-2">
                        <Text className="text-[#2E86DE] text-base font-medium">צפה בפרופיל</Text>
                        <User size={20} color="#2E86DE" />
                    </View>
                </PrimaryButton>

                <Pressable onPress={onContinue} className="py-3 items-center justify-center">
                    <View className="flex-row-reverse items-center gap-2">
                        <Text className="text-[#6B7280]">המשך לדפדף</Text>
                        <ArrowRight size={16} color="#6B7280" />
                    </View>
                </Pressable>
            </Animated.View>
        </Animated.View>
    );
}