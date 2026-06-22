import React, { useCallback, useMemo, useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CalendarDays, Send } from "lucide-react-native";
import { GRADIENT_COLORS_PRIMARY } from "@/constants/theme";
import {
    LessonOfferModal,
    LessonOfferPayload,
} from "@/components/LessonOfferModal";

type ChatComposerProps = {
    onSend: (message: string) => void;
    isTutor?: boolean;
    onCreateSessionOffer?: (payload: LessonOfferPayload) => void;
    onPressAttach?: () => void;
    onPressEmoji?: () => void;
};

export function ChatComposer({
                                 onSend,
                                 isTutor = false,
                                 onCreateSessionOffer,
                             }: ChatComposerProps) {
    const [message, setMessage] = useState("");
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

    const canSend = useMemo(() => message.trim().length > 0, [message]);

    const handleSend = useCallback(() => {
        const trimmed = message.trim();
        if (!trimmed) return;
        onSend(trimmed);
        setMessage("");
    }, [message, onSend]);

    const handleOpenOfferModal = useCallback(() => {
        setIsOfferModalOpen(true);
    }, []);

    const handleCloseOfferModal = useCallback(() => {
        setIsOfferModalOpen(false);
    }, []);

    const handleCreateSessionOffer = useCallback(
        (payload: LessonOfferPayload) => {
            onCreateSessionOffer?.(payload);
            setIsOfferModalOpen(false);
        },
        [onCreateSessionOffer]
    );

    return (
        <>
            <View className="border-t border-[rgba(0,0,0,0.07)] bg-white px-4 py-3.5">
                <View className="flex-row items-center gap-2">
                    {isTutor && (
                        <Pressable
                            onPress={handleOpenOfferModal}
                            accessibilityRole="button"
                            accessibilityLabel="קבע שיעור"
                            className="h-12 overflow-hidden rounded-full"
                            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: "row-reverse",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    paddingHorizontal: 14,
                                    borderRadius: 999,
                                    borderWidth: 1,
                                    borderColor: "rgba(46,134,222,0.25)",
                                    backgroundColor: "#F0F4FF",
                                    height: 48,
                                }}
                            >
                                <CalendarDays size={18} color="#2E86DE" />
                                <Text className="mr-2 font-medium text-[#2E86DE]">קבע שיעור</Text>
                            </View>
                        </Pressable>
                    )}

                    <View className="flex-1">
                        <TextInput
                            value={message}
                            onChangeText={setMessage}
                            placeholder="כתוב הודעה…"
                            placeholderTextColor="#9CA3AF"
                            className="w-full rounded-[20px] border border-[#E5E7EB] bg-[#F8F9FC] px-4 text-right text-[#1A1A2E]"
                            style={{
                                paddingVertical: Platform.OS === "ios" ? 12 : 10,
                                writingDirection: "rtl",
                            }}
                            returnKeyType="send"
                            blurOnSubmit={false}
                            onSubmitEditing={handleSend}
                            multiline={false}
                            textAlignVertical="center"
                        />
                    </View>

                    <Pressable
                        onPress={handleSend}
                        disabled={!canSend}
                        accessibilityRole="button"
                        accessibilityLabel="שלח הודעה"
                        className="h-14 w-14 overflow-hidden rounded-full"
                        style={({ pressed }) => [
                            {
                                opacity: canSend ? (pressed ? 0.9 : 1) : 0.5,
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={GRADIENT_COLORS_PRIMARY}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                        >
                            <Send size={22} color="white" />
                        </LinearGradient>
                    </Pressable>
                </View>
            </View>

            <LessonOfferModal
                isOpen={isOfferModalOpen}
                onClose={handleCloseOfferModal}
                onSubmit={handleCreateSessionOffer}
            />
        </>
    );
}