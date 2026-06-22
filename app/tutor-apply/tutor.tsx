import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { ArrowRight, Check, FileText } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GRADIENT_COLORS_PRIMARY } from "@/constants/theme";
import TutorApplicationStatusCard from "@/components/tutor-apply/TutorApplicationStatusCard";
import { getMyPendingApplication } from "@/api/tutorApplicationsApi";
import { TutorApplicationStatusResponse } from "@/types/tutorApplications";

export default function TutorTab() {
    const [agreed, setAgreed] = useState(false);
    const insets = useSafeAreaInsets();
    const { mode } = useLocalSearchParams<{ mode?: string }>();
    const isUpdate = mode === "update";

    const [pendingStatus, setPendingStatus] = useState<TutorApplicationStatusResponse | null>(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);

    useEffect(() => {
        getMyPendingApplication()
            .then(res => {
                if (res.hasPending) setPendingStatus(res);
            })
            .catch(() => {})
            .finally(() => setIsLoadingStatus(false));
    }, []);

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/");
        }
    };

    const handleContinue = () => {
        router.push({
            pathname: "/tutor-apply/applyTutorReq",
            params: { mode: isUpdate ? "update" : "initial" },
        });
    };

    // ─── Loading ───
    if (isLoadingStatus) {
        return (
            <View style={{ flex: 1, backgroundColor: "#F8F9FC", alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color="#2E86DE" />
            </View>
        );
    }

    // ─── Pending status — replaces terms/form entirely ───
    if (pendingStatus) {
        return <TutorApplicationStatusCard status={pendingStatus} onBack={handleBack} />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#F8F9FC" }}>
            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
            {/* ─── Inline header ─── */}
            <View style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 10,
                paddingTop: insets.top + 8,
                marginBottom: 20,
            }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 24, fontFamily: "Assistant_600SemiBold", fontWeight: "600", color: "#1A1A2E", textAlign: "right" }}>
                        {isUpdate ? "עדכון תחומי תרגול" : "הצטרף כמתרגל"}
                    </Text>
                    <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "right", marginTop: 3 }}>
                        {isUpdate ? "עדכן את תחומי ההוראה שלך" : "הצטרף לצוות המתרגלים והתחל להרוויח"}
                    </Text>
                </View>
                <Pressable
                    onPress={handleBack}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#F0F4FF", alignItems: "center", justifyContent: "center" }}>
                        <ArrowRight size={20} color="#1A1A2E" />
                    </View>
                </Pressable>
            </View>

            {/* ─── Terms Card ─── */}
            <View
                className="overflow-hidden rounded-3xl mb-5 bg-white"
                style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.07)" }}
            >
                {/* Accent top bar */}
                <LinearGradient
                    colors={GRADIENT_COLORS_PRIMARY}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ height: 4, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
                />

                <View className="p-6">
                    {/* Section header */}
                    <View className="mb-5 flex-row-reverse items-center gap-3">
                        <View
                            className="h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F4FF]"
                            style={{ borderWidth: 1, borderColor: "rgba(46,134,222,0.20)" }}
                        >
                            <FileText size={22} color="#2E86DE" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-right text-xl font-bold text-[#1A1A2E]">
                                {isUpdate ? "תנאים לעדכון תחומי תרגול" : "תנאים להגשת בקשה"}
                            </Text>
                            <Text className="mt-1 text-right text-sm text-[#6B7280]">
                                יש לקרוא ולאשר לפני המשך
                            </Text>
                        </View>
                    </View>

                    {/* Terms text */}
                    <View className="gap-4 mb-6">
                        <View
                            className="rounded-2xl p-4 bg-[#F8F9FC]"
                            style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
                        >
                            <Text className="text-right text-base leading-7 text-[#1A1A2E]">
                                על מנת לתרגל בקורס מסוים צריך להיות בו לפחות{" "}
                                <Text className="font-bold text-[#2E86DE]">ציון מעל 85</Text>, ובכפוף{" "}
                                <Text className="font-bold text-[#2E86DE]">לאישור המוסד האקדמאי</Text>.
                            </Text>
                        </View>

                        <View
                            className="rounded-2xl p-4 bg-[#F8F9FC]"
                            style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
                        >
                            <Text className="text-right text-base leading-7 text-[#1A1A2E]">
                                יש לצרף{" "}
                                <Text className="font-bold text-[#2E86DE]">גיליון ציונים רלוונטי</Text>{" "}
                                לאותם קורסים שבהם בוחרים.
                            </Text>
                        </View>

                        <View
                            className="rounded-2xl p-4 bg-[#F8F9FC]"
                            style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
                        >
                            <Text className="text-right text-base leading-7 text-[#1A1A2E]">
                                {isUpdate
                                    ? <>אישור הבקשה <Text className="font-bold text-[#2E86DE]">יחליף</Text> את תחומי התרגול הנוכחיים שלך.</>
                                    : <>שימו לב:{" "}<Text className="font-bold text-[#2E86DE]">ניתן להגיש בקשה אחת בלבד בכל פעם</Text>.</>
                                }
                            </Text>
                        </View>

                        {isUpdate && (
                            <View
                                className="rounded-2xl p-4"
                                style={{ backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FCD34D" }}
                            >
                                <Text className="text-right text-base leading-7 text-[#1A1A2E]">
                                    <Text className="font-bold text-[#D97706]">שים לב: </Text>
                                    יש לבחור את כל הקורסים שברצונך ללמד, כולל קורסים שאושרו בעבר. קורס שלא יסומן מחדש לא ייכלל בתחומי ההוראה שלך לאחר העדכון. גיליון הציונים חייב לכלול את כל הקורסים שסומנו.
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Agree checkbox */}
                    <Pressable
                        onPress={() => setAgreed(!agreed)}
                        className="mb-5 flex-row-reverse items-center rounded-2xl p-4"
                        style={{
                            borderWidth: 1,
                            borderColor: agreed ? "rgba(46,134,222,0.35)" : "rgba(0,0,0,0.07)",
                            backgroundColor: agreed ? "rgba(46,134,222,0.08)" : "#F8F9FC",
                        }}
                    >
                        <View
                            className="h-7 w-7 items-center justify-center rounded-lg"
                            style={{
                                borderWidth: 2,
                                borderColor: agreed ? "#2E86DE" : "rgba(0,0,0,0.20)",
                                backgroundColor: agreed ? "#2E86DE" : "transparent",
                            }}
                        >
                            {agreed && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                        </View>
                        <Text className="mr-3 flex-1 text-right text-base font-semibold text-[#1A1A2E]">
                            קראתי והבנתי את התנאים
                        </Text>
                    </Pressable>

                    {/* Submit button */}
                    <PrimaryButton
                        disabled={!agreed}
                        onPress={handleContinue}
                    >
                        {isUpdate ? "המשך לעדכון" : "הגש בקשה"}
                    </PrimaryButton>

                    {!agreed && (
                        <Text className="mt-3 text-right text-sm text-[#A66CFF]">
                            כדי להמשיך יש לסמן שקראת והבנת את התנאים
                        </Text>
                    )}
                </View>
            </View>
        </ScrollView>
        </View>
    );
}
