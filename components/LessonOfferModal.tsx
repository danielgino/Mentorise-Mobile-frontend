import React, { useMemo, useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import DateTimePicker, {
    DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { Clock, CalendarDays } from "lucide-react-native";
import { BaseModal } from "@/components/ui/BaseModal";

type Duration = 45 | 90 | 135 | 180;
type IOSPickerMode = "date" | "time" | null;

export type LessonOfferPayload = {
    startTime: string;
    endTime: string;
    note?: string;
};

interface LessonOfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: LessonOfferPayload) => void;
}

const durationOptions: { value: Duration; label: string; shortLabel: string }[] = [
    { value: 45,  label: "שעה אקדמית אחת",  shortLabel: "1 שעה"  },
    { value: 90,  label: "2 שעות אקדמיות",  shortLabel: "2 שעות" },
    { value: 135, label: "3 שעות אקדמיות",  shortLabel: "3 שעות" },
    { value: 180, label: "4 שעות אקדמיות",  shortLabel: "4 שעות" },
];

function pad(value: number) {
    return String(value).padStart(2, "0");
}

function formatDateLabel(date: Date) {
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function formatTimeLabel(date: Date) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toLocalDateTimeString(date: Date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
        date.getHours()
    )}:${pad(date.getMinutes())}:00`;
}

function combineDateAndTime(datePart: Date, timePart: Date) {
    const combined = new Date(datePart);
    combined.setHours(timePart.getHours(), timePart.getMinutes(), 0, 0);
    return combined;
}

export function LessonOfferModal({ isOpen, onClose, onSubmit }: LessonOfferModalProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [duration, setDuration] = useState<Duration>(45);
    const [note, setNote] = useState("");
    const [iosPickerMode, setIosPickerMode] = useState<IOSPickerMode>(null);

    const calculatedStartDateTime = useMemo(() => {
        if (!selectedTime) return null;
        return combineDateAndTime(selectedDate, selectedTime);
    }, [selectedDate, selectedTime]);

    const calculatedEndDateTime = useMemo(() => {
        if (!calculatedStartDateTime) return null;
        return new Date(calculatedStartDateTime.getTime() + duration * 60 * 1000);
    }, [calculatedStartDateTime, duration]);

    const calculatedPrice = useMemo(() => (duration / 45) * 110, [duration]);

    const canSubmit = !!calculatedStartDateTime && !!calculatedEndDateTime;

    const resetForm = () => {
        setSelectedDate(new Date());
        setSelectedTime(null);
        setDuration(45);
        setNote("");
        setIosPickerMode(null);
    };

    const handleClose = () => {
        setIosPickerMode(null);
        onClose();
    };

    const handleSubmit = () => {
        if (!canSubmit || !calculatedStartDateTime || !calculatedEndDateTime) return;
        onSubmit({
            startTime: toLocalDateTimeString(calculatedStartDateTime),
            endTime: toLocalDateTimeString(calculatedEndDateTime),
            note: note.trim() || undefined,
        });
        resetForm();
        onClose();
    };

    const openDatePicker = () => {
        if (Platform.OS === "android") {
            DateTimePickerAndroid.open({
                value: selectedDate,
                mode: "date",
                is24Hour: true,
                onChange: (event, value) => {
                    if (event.type === "set" && value) setSelectedDate(value);
                },
            });
            return;
        }
        setIosPickerMode("date");
    };

    const openTimePicker = () => {
        if (Platform.OS === "android") {
            DateTimePickerAndroid.open({
                value: selectedTime ?? new Date(),
                mode: "time",
                is24Hour: true,
                onChange: (event, value) => {
                    if (event.type === "set" && value) setSelectedTime(value);
                },
            });
            return;
        }
        setIosPickerMode("time");
    };

    return (
        <BaseModal
            visible={isOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            title="קביעת שיעור"
            subtitle="מלא את פרטי ההצעה ושלח לסטודנט"
            submitLabel="שלח הצעה"
            cancelLabel="ביטול"
            submitDisabled={!canSubmit}
            layout="dialog"
            scrollToEndOnKeyboard
            bottomSlot={
                Platform.OS === "ios" && iosPickerMode ? (
                    <View
                        pointerEvents="box-none"
                        style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            paddingHorizontal: 12,
                            paddingBottom: 12,
                        }}
                    >
                        <View
                            style={{
                                borderTopLeftRadius: 24,
                                borderTopRightRadius: 24,
                                borderWidth: 1,
                                borderColor: "rgba(0,0,0,0.08)",
                                backgroundColor: "#FFFFFF",
                                overflow: "hidden",
                            }}
                        >
                            <View className="flex-row-reverse items-center justify-between px-5 py-4">
                                <Pressable onPress={() => setIosPickerMode(null)}>
                                    <Text className="text-base font-semibold text-black/70">סגור</Text>
                                </Pressable>

                                <Text className="text-base font-bold text-black">
                                    {iosPickerMode === "date" ? "בחירת תאריך" : "בחירת שעה"}
                                </Text>

                                <Pressable onPress={() => setIosPickerMode(null)}>
                                    <Text className="text-base font-bold text-[#2E86DE]">אישור</Text>
                                </Pressable>
                            </View>

                            <DateTimePicker
                                value={iosPickerMode === "date" ? selectedDate : selectedTime ?? new Date()}
                                mode={iosPickerMode}
                                display="spinner"
                                themeVariant="light"
                                textColor="#111111"
                                accentColor="#2E86DE"
                                is24Hour={iosPickerMode === "time"}
                                style={{ backgroundColor: "#FFFFFF" }}
                                onChange={(_, value) => {
                                    if (!value) return;
                                    if (iosPickerMode === "date") setSelectedDate(value);
                                    else setSelectedTime(value);
                                }}
                                onDismiss={() => setIosPickerMode(null)}
                            />
                        </View>
                    </View>
                ) : null
            }
        >
            <View className="gap-4">
                {/* Date */}
                <View>
                    <Text className="mb-2 text-right text-base font-medium text-[#1A1A2E]">תאריך</Text>
                    <Pressable
                        onPress={openDatePicker}
                        className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4"
                    >
                        <View className="flex-row-reverse items-center justify-between">
                            <Text className="text-right text-base text-[#1A1A2E]">
                                {formatDateLabel(selectedDate)}
                            </Text>
                            <CalendarDays size={20} color="#6B7280" />
                        </View>
                    </Pressable>
                </View>

                {/* Start time */}
                <View>
                    <Text className="mb-2 text-right text-base font-medium text-[#1A1A2E]">שעת התחלה</Text>
                    <Pressable
                        onPress={openTimePicker}
                        className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4"
                    >
                        <View className="flex-row-reverse items-center justify-between">
                            <Text
                                className={`text-right text-base ${
                                    selectedTime ? "text-[#1A1A2E]" : "text-[#9CA3AF]"
                                }`}
                            >
                                {selectedTime ? formatTimeLabel(selectedTime) : "בחר שעה"}
                            </Text>
                            <Clock size={20} color="#6B7280" />
                        </View>
                    </Pressable>
                </View>

                {/* Duration */}
                <View>
                    <Text className="mb-2 text-right text-base font-medium text-[#1A1A2E]">משך השיעור</Text>
                    <View className="flex-row-reverse flex-wrap justify-between gap-y-3">
                        {durationOptions.map((option) => {
                            const selected = duration === option.value;
                            return (
                                <Pressable
                                    key={option.value}
                                    onPress={() => setDuration(option.value)}
                                    className={`w-[48.5%] rounded-2xl px-3 py-4 ${
                                        selected
                                            ? "border border-[#2E86DE]/30 bg-[#F0F4FF]"
                                            : "border border-[#E5E7EB] bg-white"
                                    }`}
                                >
                                    <Text
                                        className={`text-center text-base font-semibold ${
                                            selected ? "text-[#2E86DE]" : "text-[#1A1A2E]"
                                        }`}
                                    >
                                        {option.shortLabel}
                                    </Text>
                                    <Text
                                        className={`mt-1 text-center text-sm ${
                                            selected ? "text-[#6B7280]" : "text-[#9CA3AF]"
                                        }`}
                                    >
                                        {option.value} דק׳
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Calculated summary */}
                {calculatedStartDateTime && calculatedEndDateTime && (
                    <View
                        style={{
                            borderRadius: 18,
                            padding: 18,
                            borderWidth: 1,
                            borderColor: "rgba(46,134,222,0.15)",
                            backgroundColor: "#F0F4FF",
                        }}
                    >
                        <View className="mb-3 flex-row-reverse items-center gap-2">
                            <Clock size={18} color="#2E86DE" />
                            <Text className="text-right text-sm text-[#6B7280]">חישוב אוטומטי</Text>
                        </View>

                        <View className="flex-row-reverse justify-between">
                            <View className="flex-1">
                                <Text className="mb-1 text-right text-sm text-[#9CA3AF]">
                                    שעת סיום מחושבת
                                </Text>
                                <Text className="text-right text-2xl font-bold text-[#2E86DE]">
                                    {formatTimeLabel(calculatedEndDateTime)}
                                </Text>
                            </View>

                            <View className="flex-1">
                                <Text className="mb-1 text-right text-sm text-[#9CA3AF]">משך כולל</Text>
                                <Text className="text-right text-2xl font-bold text-[#A66CFF]">
                                    {duration} דק׳
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Price */}
                <View>
                    <Text className="mb-2 text-right text-base font-medium text-[#1A1A2E]">מחיר</Text>
                    <View className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4">
                        <View className="flex-row-reverse items-center justify-between">
                            <Text className="text-right text-lg font-bold text-[#1A1A2E]">
                                ₪{calculatedPrice}
                            </Text>
                            <Text className="text-right text-base text-[#9CA3AF]">
                                {duration / 45} שעות אקדמיות × ₪110
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Note */}
                <View>
                    <Text className="mb-2 text-right text-base font-medium text-[#1A1A2E]">הערה</Text>
                    <TextInput
                        value={note}
                        onChangeText={setNote}
                        placeholder="הוסף הערה (אופציונלי)"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={2}
                        textAlignVertical="top"
                        className="min-h-[88px] rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 text-right text-base text-[#1A1A2E]"
                        style={{ writingDirection: "rtl" }}
                    />
                </View>
            </View>
        </BaseModal>
    );
}
