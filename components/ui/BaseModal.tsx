import React, { ReactNode } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X } from "lucide-react-native";
import { GRADIENT_COLORS_PRIMARY } from "@/constants/theme";

type BaseModalProps = {
    visible: boolean;
    onClose: () => void;
    onSubmit: () => void;
    title: string;
    /** Subtitle shown below the title — used in dialog layout */
    subtitle?: string;
    submitLabel: string;
    cancelLabel?: string;
    children: ReactNode;
    loading?: boolean;
    /** Disables and dims the submit button — used in dialog layout */
    submitDisabled?: boolean;
    /**
     * "sheet"  → bottom sheet (MockPaymentModal style)
     * "dialog" → centered dialog with glow border + rainbow bar (LessonOfferModal style)
     */
    layout?: "sheet" | "dialog";
    /** Rendered outside the KeyboardAvoidingView, inside the backdrop — used for iOS date pickers */
    bottomSlot?: ReactNode;
};

export function BaseModal({
    visible,
    onClose,
    onSubmit,
    title,
    subtitle,
    submitLabel,
    cancelLabel = "ביטול",
    children,
    loading = false,
    submitDisabled = false,
    layout = "sheet",
    bottomSlot,
}: BaseModalProps) {
    const isSubmitBlocked = submitDisabled || loading;

    // ─── sheet layout (bottom sheet) ──────────────────────────────────────────
    if (layout === "sheet") {
        return (
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={loading ? undefined : onClose}
            >
                <View className="flex-1 justify-end bg-black/60">
                    <Pressable
                        className="absolute inset-0"
                        onPress={() => { if (!loading) onClose(); }}
                    />

                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                    >
                        <View className="rounded-t-[32px] border-t border-[rgba(0,0,0,0.07)] bg-white px-5 pb-8 pt-5">
                            {/* Header */}
                            <View className="mb-4 flex-row-reverse items-center justify-between">
                                <Pressable
                                    onPress={onClose}
                                    disabled={loading}
                                    className="h-10 w-10 items-center justify-center rounded-full border border-[rgba(0,0,0,0.07)] bg-[#F0F4FF]"
                                >
                                    <X size={18} color="#1A1A2E" />
                                </Pressable>

                                <Text className="text-right text-xl font-semibold text-[#1A1A2E]">
                                    {title}
                                </Text>

                                {/* Spacer balances the X button */}
                                <View className="h-10 w-10" />
                            </View>

                            <ScrollView
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                {children}

                                {/* Footer */}
                                <View className="mt-6 flex-row-reverse gap-3">
                                    <Pressable
                                        onPress={onClose}
                                        disabled={loading}
                                        className="flex-1 rounded-2xl border border-[#E5E7EB] bg-[#F0F4FF] py-4"
                                    >
                                        <Text className="text-center text-base font-medium text-[#6B7280]">
                                            {cancelLabel}
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={onSubmit}
                                        disabled={isSubmitBlocked}
                                        className="flex-1 overflow-hidden rounded-2xl"
                                        style={{ opacity: isSubmitBlocked ? 0.5 : 1 }}
                                    >
                                        <LinearGradient
                                            colors={GRADIENT_COLORS_PRIMARY}
                                            start={{ x: 1, y: 0.5 }}
                                            end={{ x: 0, y: 0.5 }}
                                            style={{
                                                paddingVertical: 16,
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {loading ? (
                                                <ActivityIndicator color="#FFFFFF" />
                                            ) : (
                                                <Text className="text-base font-medium text-white text-center">
                                                    {submitLabel}
                                                </Text>
                                            )}
                                        </LinearGradient>
                                    </Pressable>
                                </View>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>

                    {bottomSlot}
                </View>
            </Modal>
        );
    }

    // ─── dialog layout (centered dialog) ──────────────────────────────────────
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center bg-black/70 px-4 py-6">
                <Pressable className="absolute inset-0" onPress={onClose} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    className="w-full"
                >
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ flexGrow: 1 }}
                    >
                        <View className="relative self-center w-full" style={{ maxWidth: 430 }}>
                            <View className="overflow-hidden rounded-[28px] border border-[rgba(0,0,0,0.07)] bg-white">
                                {/* Rainbow top bar */}
                                <LinearGradient
                                    colors={GRADIENT_COLORS_PRIMARY}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ height: 6 }}
                                />

                                <View style={{ padding: 22 }}>
                                    {/* Header */}
                                    <View className="mb-6 flex-row-reverse items-start justify-between">
                                        <View className="flex-1">
                                            <Text className="text-right text-[28px] font-bold text-[#1A1A2E]">
                                                {title}
                                            </Text>
                                            {subtitle ? (
                                                <Text className="mt-1.5 text-right text-base text-[#6B7280]">
                                                    {subtitle}
                                                </Text>
                                            ) : null}
                                        </View>

                                        <Pressable
                                            onPress={onClose}
                                            className="ml-3 h-11 w-11 items-center justify-center rounded-full border border-[rgba(0,0,0,0.07)] bg-[#F0F4FF]"
                                        >
                                            <X size={22} color="#1A1A2E" />
                                        </Pressable>
                                    </View>

                                    {children}

                                    {/* Footer */}
                                    <View className="mt-6 flex-row-reverse gap-3">
                                        <Pressable
                                            onPress={onSubmit}
                                            disabled={isSubmitBlocked}
                                            className="flex-1 overflow-hidden rounded-2xl"
                                            style={{ opacity: isSubmitBlocked ? 0.5 : 1 }}
                                        >
                                            <LinearGradient
                                                colors={GRADIENT_COLORS_PRIMARY}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={{
                                                    paddingVertical: 16,
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                {loading ? (
                                                    <ActivityIndicator color="#FFFFFF" />
                                                ) : (
                                                    <Text className="text-base font-bold text-white">
                                                        {submitLabel}
                                                    </Text>
                                                )}
                                            </LinearGradient>
                                        </Pressable>

                                        <Pressable
                                            onPress={onClose}
                                            className="flex-1 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#F0F4FF] py-4"
                                        >
                                            <Text className="text-base font-semibold text-[#6B7280]">
                                                {cancelLabel}
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {bottomSlot}
            </View>
        </Modal>
    );
}
