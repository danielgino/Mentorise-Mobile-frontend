import React, { useMemo, useState } from "react";
import {View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, Alert} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { ChevronRight } from "lucide-react-native";
import { FormInput } from "@/components/ui/inputs/FormInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {useRegisterDraft} from "@/hooks/RegisterContext";
import {ProgressBar} from "@/components/ui/ProgressBar";
import {ROUTES} from "@/constants/routes";
import {normalize, validateField, validateStep1} from "@/constants/registerValidators";
import {IdCard, User, Users, Mail, Lock, Eye, EyeOff, Phone,
} from "lucide-react-native";
type RegistrationData = {
    firstName: string;
    lastName: string;
    nationalId: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
};

export default function RegistrationScreen() {
    const router = useRouter();
    const { setDraft } = useRegisterDraft();
    const [errors, setErrors] = useState<Partial<Record<keyof RegistrationData, string>>>({});

    const [formData, setFormData] = useState<RegistrationData>({
        firstName: "",
        lastName: "",
        nationalId: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
    });

    const canContinue = useMemo(() => {
        // אפשר להשאיר “רך” כדי לצבוע כפתור, ההכרעה האמיתית ב-handleSubmit
        return Object.values(formData).every(v => (v ?? "").trim().length > 0)
            && formData.password === formData.confirmPassword;
    }, [formData]);

    const handleSubmit = () => {
        const { errors: e, values } = validateStep1(formData);
        setErrors(e);
        if (Object.keys(e).length > 0) {
            Alert.alert("שגיאה", "יש שדות שדורשים תיקון לפני המשך.");
            return;
        }

        // עדכון ה-Context עם ערכים מנורמלים
        setDraft(prev => ({
            ...prev,
            nationalId: values.nationalId,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password,
            phoneNumber: values.phoneNumber,
        }));

        router.push({ pathname: ROUTES.ONBOARDING.MAJOR_SELECT, params: { mode: "signup" } });
    };

    return (
        <Animated.View
            entering={FadeInRight.duration(220)}
            exiting={FadeOutLeft.duration(220)}
            className="flex-1 px-6 py-8"
        >
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                {/* Header */}
                <View className="flex-row-reverse items-center justify-between mb-8">
                    <Text className="text-2xl text-[#1A1A2E] text-right">פרטים אישיים</Text>

                    <Pressable onPress={() => router.back()} className="p-2 rounded-full">
                        <ChevronRight size={24} color="#6B7280" />
                    </Pressable>
                </View>

                <ProgressBar total={3} active={1} />

                {/* Form */}
                <ScrollView
                    className="flex-1"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="space-y-4">
                        <FormInput
                            label="תעודת זהות"
                            value={formData.nationalId}
                            onChange={(v) => setFormData(s => ({ ...s, nationalId: v }))}
                            onBlurValidate={(v) => validateField("nationalId", v, formData)}
                            error={errors.nationalId}
                            keyboardType="phone-pad"
                            rightIcon={<IdCard/>}
                        />

                        <FormInput
                            label="שם פרטי"
                            value={formData.firstName}
                            onChange={(v) => setFormData(s => ({ ...s, firstName: v }))}
                            onBlurValidate={(v) => validateField("firstName", v, formData)}
                            error={errors.firstName}
                            rightIcon={<User/>}

                        />

                        <FormInput
                            label="שם משפחה"
                            value={formData.lastName}
                            onChange={(v) => setFormData(s => ({ ...s, lastName: v }))}
                            onBlurValidate={(v) => validateField("lastName", v, formData)}
                            error={errors.lastName}
                            rightIcon={<Users/>}
                        />

                        <FormInput
                            label="אימייל"
                            keyboardType="email-address"
                            value={formData.email}
                            onChange={(v) => setFormData(s => ({ ...s, email: normalize.email(v) }))}
                            onBlurValidate={(v) => validateField("email", v, formData)}
                            error={errors.email}
                            rightIcon={<Mail/>}

                        />

                        <FormInput
                            label="סיסמה"
                            value={formData.password}
                            onChange={(v) => setFormData(s => ({ ...s, password: v }))}
                            onBlurValidate={(v) => validateField("password", v, formData)}
                            error={errors.password}
                            showPasswordToggle
                            secureTextEntry
                            rightIcon={<Lock/>}
                        />

                        <FormInput
                            label="חזור על הסיסמה"
                            value={formData.confirmPassword}
                            onChange={(v) => setFormData(s => ({ ...s, confirmPassword: v }))}
                            onBlurValidate={(v) => validateField("confirmPassword", v, formData)}
                            error={errors.confirmPassword}
                            showPasswordToggle
                            secureTextEntry
                            rightIcon={<Lock/>}

                        />

                        <FormInput
                            label="פלאפון"
                            keyboardType="phone-pad"
                            value={formData.phoneNumber}
                            onChange={(v) => setFormData(s => ({ ...s, phoneNumber: v }))}
                            onBlurValidate={(v) => validateField("phoneNumber", v, formData)}
                            error={errors.phoneNumber}
                            rightIcon={<Phone/>}

                        />

                    </View>
                </ScrollView>

                <View className="mt-4">
                    <PrimaryButton onPress={handleSubmit} disabled={!canContinue}>
                        המשך
                    </PrimaryButton>
                </View>
            </KeyboardAvoidingView>
        </Animated.View>
    );
}
