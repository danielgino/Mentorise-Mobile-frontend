import { View, Text } from "react-native";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export default function SuccessScreen({
    onBackToHome,
    onViewApplications,
    mode,
}: {
    onBackToHome: () => void;
    onViewApplications: () => void | Promise<void>;
    mode?: string;
}) {
    const isUpdate = mode === "update";
    return (
        <View className="flex-1 bg-white items-center justify-center px-6">
            <Text className="text-2xl font-extrabold">
                {isUpdate ? "עדכון הבקשה נשלח ✅" : "הבקשה נשלחה ✅"}
            </Text>
            <Text className="text-center text-[#6B7280] mt-2">
                {isUpdate
                    ? "הבקשה לעדכון תחומי התרגול נקלטה ותיבדק בקרוב"
                    : "הבקשה נקלטה ותיבדק בקרוב."}
            </Text>

            <View className="w-full mt-8 gap-3">
                <PrimaryButton fullWidth={false} onPress={onViewApplications}>צפה בבקשות</PrimaryButton>
                <PrimaryButton fullWidth={false} onPress={onBackToHome}>חזרה לדף הבית</PrimaryButton>
            </View>
        </View>
    );
}
