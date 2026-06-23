import React from "react";
import { Text, View } from "react-native";
import TutorCoverImage from "@/components/ui/profile/TutorCoverImage";

type TutorImagePreviewProps = {
    imageUrl?: string;
    name: string;
    uploading?: boolean;
};

export default function TutorImagePreview({
                                              imageUrl,
                                              name,
                                              uploading = false,
                                          }: TutorImagePreviewProps) {
    return (
        <View className="w-full">
            <TutorCoverImage
                imageUrl={imageUrl}
                name={name}
                height={220}
                rounded={true}
                uploading={uploading}
            />

            <Text className="mt-3 text-center text-xs text-[#9CA3AF]">
                תצוגה מקדימה כפי שהתמונה תופיע בפרופיל
            </Text>
        </View>
    );
}