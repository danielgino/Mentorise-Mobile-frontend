import React from "react";
import { Text, View } from "react-native";
import { GraduationCap } from "lucide-react-native";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TutorApplicationStatusResponse } from "@/types/tutorApplications";

function formatApplicationDate(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
        return dateStr;
    }
}

export default function TutorApplicationStatusCard({
    status,
    onBack,
}: {
    status: TutorApplicationStatusResponse;
    onBack: () => void;
}) {
    const typeLabel = status.applicationType === "UPDATE"
        ? "עדכון תחומי תרגול"
        : "בקשת הצטרפות כמתרגל";

    return (
        <View className="flex-1 bg-[#F9FAFB] items-center justify-center px-6">
            <View
                className="w-full rounded-3xl bg-white p-8 items-center"
                style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
            >
                <GraduationCap size={48} color="#F59E0B" />
                {status.applicationId != null && (
                    <Text className="mt-4 text-sm text-[#6B7280] text-center">
                        בקשה מספר #{status.applicationId}
                    </Text>
                )}
                <Text className="mt-2 text-xl font-bold text-[#1A1A2E] text-center">
                    {typeLabel}
                </Text>
                <Text className="mt-2 text-base font-semibold text-[#F59E0B] text-center">
                    ממתינה לאישור
                </Text>
                {status.createdAt && (
                    <Text className="mt-2 text-sm text-[#6B7280] text-center">
                        הוגשה בתאריך: {formatApplicationDate(status.createdAt)}
                    </Text>
                )}
                <View className="mt-6 w-full">
                    <PrimaryButton onPress={onBack}>חזרה</PrimaryButton>
                </View>
            </View>
        </View>
    );
}
