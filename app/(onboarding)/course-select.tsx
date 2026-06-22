import React, {useMemo, useState} from "react";
import {View, Text, ScrollView, Alert} from "react-native";
import { useRouter, useGlobalSearchParams } from "expo-router";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Chip } from "@/components/ui/Chip";
import {useMyCourses} from "@/hooks/useMyCourses";
import {upsertLearningPreferences} from "@/api/learningPreferencesApi";
import {ROUTES} from "@/constants/routes";


export default function CourseSelectionScreen() {
    const router = useRouter();
    const params = useGlobalSearchParams();
    const mode = (params.mode as string) || "signup";
    const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
    const { courses, loading, error } = useMyCourses({ enabled: true });
    const [loadingSave, setLoadingSave] = useState(false);


    const toggleCourse = (courseId: number) => {
        setSelectedCourses((prev) =>
            prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
        );
    };
    const selectedCountText = useMemo(() => {
        if (selectedCourses.length === 0) return null;
        return `נבחרו ${selectedCourses.length} קורסים`;
    }, [selectedCourses.length]);


    const handleContinue = async () => {
        if (selectedCourses.length === 0) {
            Alert.alert("שים לב", "בחר לפחות קורס אחד לפני המעבר");
            return;
        }

        try {
            setLoadingSave(true);
            await upsertLearningPreferences({
                scopeType: "COURSE",
                courseIds: selectedCourses,
            });

            if (mode === "signup") {
                router.push({ pathname: ROUTES.ONBOARDING.FINDING, params: { mode: "signup" } });
            } else {
                router.replace("/(tabs)");
            }
        } catch (e: any) {
            if (__DEV__) console.warn("❌ שמירת העדפות נכשלה:", e);
            Alert.alert("שגיאה", e?.message || "לא ניתן לשמור את הבחירה");
        } finally {
            setLoadingSave(false);
        }
    };

    const handleBack = () => {
        router.push({ pathname: "/(onboarding)/learning-type", params: { mode } });
    };





    return (
        <Animated.View
            entering={FadeInRight.duration(220)}
            exiting={FadeOutLeft.duration(220)}
            className="flex-1 px-6 py-12"
        >
            <View className="items-center mb-8">
                <Text className="text-2xl text-[#1A1A2E] text-center mb-2">
                    באילו קורסים אתה צריך עזרה?
                </Text>
                <Text className="text-[#6B7280] text-center">בחר קורס אחד או יותר</Text>
            </View>

            <View className="flex-1 mb-8">
                {loading ? (
                    <Text className="text-[#6B7280] text-center">טוען קורסים…</Text>
                ) : error ? (
                    <Text className="text-[#E24B4A] text-center">{error}</Text>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                        <View className="flex-row-reverse flex-wrap gap-3 justify-right">
                            {courses.map(course => (
                                <Chip
                                    variant="course"
                                    key={course.id}
                                    label={course.name}
                                    selected={selectedCourses.includes(course.id)}
                                    onPress={() => toggleCourse(course.id)}
                                />
                            ))}
                        </View>
                    </ScrollView>
                )}
            </View>
            {selectedCountText ? (
                <Text className="text-center text-[#6B7280] mb-4">{selectedCountText}</Text>
            ) : null}

            {/* Buttons */}
            <View className="gap-3">
                <PrimaryButton onPress={handleContinue}>
                    {loadingSave ? "שומר..." : "מצא לי מתרגלים"}
                </PrimaryButton>

                <PrimaryButton variant="secondary" onPress={handleBack}>
                    חזור אחורה
                </PrimaryButton>
            </View>
        </Animated.View>
    );
}
