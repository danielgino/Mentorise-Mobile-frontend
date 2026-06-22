import React, { useMemo, useState } from "react";
import {View, Text, Alert} from "react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { GraduationCap, BookOpen } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { useRegisterDraft } from "@/hooks/RegisterContext";
import {registerUser, login, RegisterRequest} from "@/api/auth";
import {getMe} from "@/api/meApi";
import {useAuth} from "@/hooks/AuthProvider";
import {ProgressBar} from "@/components/ui/ProgressBar";
import { ROUTES } from "@/constants/routes";
import {validateStep1, validateStep2, validateStep3} from "@/constants/registerValidators";
type StudyStatus = "student" | "graduate" | "";

export default function StudyStatusScreen() {
    const { draft, setDraft, resetDraft  } = useRegisterDraft();
    const [selected, setSelected] = useState<StudyStatus>("");
    const [loading, setLoading] = useState(false);
    const { setUser } = useAuth();

    const canContinue = useMemo(
        () => selected !== "" && !loading,
        [selected, loading]
    );

    const handleContinue = async () => {
        if (loading) return;

        // 1) שלב 3: חייב לבחור סטטוס
        const { errors: e3 } = validateStep3({ studyStatus: selected });
        if (e3.studyStatus) {
            Alert.alert("שגיאה", e3.studyStatus);
            return;
        }

        const isAlumni = selected === "graduate";

        // 2) שלב 2: חייב לבחור מסלול
        const { errors: e2 } = validateStep2({ majorId: draft.majorId ?? null });
        if (e2.majorId) {
            Alert.alert("שגיאה", e2.majorId);
            router.replace({ pathname: ROUTES.ONBOARDING.MAJOR_SELECT, params: { mode: "signup" } });
            return;
        }

        // 3) שלב 1: תאימות מלאה (Regex + password rules)
        const { errors: e1, values } = validateStep1({
            nationalId: draft.nationalId ?? "",
            firstName: draft.firstName ?? "",
            lastName: draft.lastName ?? "",
            email: draft.email ?? "",
            password: draft.password ?? "",
            confirmPassword: draft.password ?? "", // אין לך confirm בדראפט, אז משווים לעצמו
            phoneNumber: draft.phoneNumber ?? "",
        });

        if (Object.keys(e1).length > 0) {
            Alert.alert("שגיאה", "חלק מהפרטים לא תקינים. נחזיר אותך לשלב הראשון לתיקון.");
            router.replace({ pathname: ROUTES.ONBOARDING.REGISTER, params: { mode: "signup" } });
            return;
        }

        const registerPayload: RegisterRequest = {
            nationalId: values.nationalId,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password,
            phoneNumber: values.phoneNumber,
            majorId: draft.majorId!, // בטוח אחרי validateStep2
            isAlumni,
        };

        setLoading(true);
        try {
            await registerUser(registerPayload);
            await login(registerPayload.email, registerPayload.password);
            const me = await getMe();
            setUser(me);

            setDraft(s => ({ ...s, isAlumni }));
            resetDraft();
            router.replace({ pathname: ROUTES.ONBOARDING.LEARNING_TYPE, params: { mode: "signup" } });
        } catch (e) {
            if (__DEV__) console.warn("❌ registration failed", e);
            Alert.alert("שגיאה", "הרשמה נכשלה. נסה שוב.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Animated.View
            entering={FadeInRight.duration(220)}
            exiting={FadeOutLeft.duration(220)}
            className="flex-1 px-6 py-12"
        >

            <ProgressBar total={3} active={3} />

            {/* Question */}
            <View className="items-center mb-12">
                <Text className="text-3xl text-[#1A1A2E] text-center">מה הסטטוס שלך?</Text>
            </View>

            {/* Options */}
            <View className="flex-1 gap-4 mb-8">
                <GlassCard selected={selected === "student"} onPress={() => setSelected("student")}>
                    <View className="flex-row-reverse items-center gap-4">
                        <LinearGradient
                            colors={["rgba(46,134,222,0.12)", "rgba(46,134,222,0.08)"]}
                            style={{ width: 64, height: 64, borderRadius: 999 }}
                        >
                            <View className="flex-1 items-center justify-center">
                                <BookOpen size={32} color="#2E86DE" />
                            </View>
                        </LinearGradient>
                        <View className="flex-1">
                            <Text className="text-xl text-[#1A1A2E] text-right">סטודנט פעיל</Text>
                        </View>
                    </View>
                </GlassCard>

                <GlassCard selected={selected === "graduate"} onPress={() => setSelected("graduate")}>
                    <View className="flex-row-reverse items-center gap-4">
                        <LinearGradient
                            colors={["rgba(46,134,222,0.10)", "rgba(166,108,255,0.10)"]}
                            style={{ width: 64, height: 64, borderRadius: 999 }}
                        >
                            <View className="flex-1 items-center justify-center">
                                <GraduationCap size={32} color="#A66CFF" />
                            </View>
                        </LinearGradient>
                        <View className="flex-1">
                            <Text className="text-xl text-[#1A1A2E] text-right">בוגר</Text>
                        </View>
                    </View>
                </GlassCard>
            </View>

            <PrimaryButton onPress={handleContinue} disabled={!canContinue}>
                {loading ? "נרשם..." : "המשך"}
            </PrimaryButton>
        </Animated.View>
    );
}
