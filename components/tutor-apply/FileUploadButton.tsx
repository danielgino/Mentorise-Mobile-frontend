import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

export type PickedFile = {
    name: string;
    uri: string;
    size?: number;
};

export default function FileUploadButton({
                                             label,
                                             value,
                                             onChange,
                                             helper,
                                         }: {
    label: string;
    value: PickedFile | null;
    onChange: (f: PickedFile | null) => void;
    helper?: string;
}) {
    const pick = async () => {
        const res = await DocumentPicker.getDocumentAsync({
            type: ["application/pdf", "image/*"],
            multiple: false,
            copyToCacheDirectory: true,
        });

        if (res.canceled) return;
        const file = res.assets?.[0];
        if (!file) return;

        onChange({ name: file.name ?? "file", uri: file.uri, size: file.size });
    };

    return (
        <View>
            <Text className="text-right text-sm font-bold text-[#111827] mb-2">{label}</Text>

            <Pressable onPress={pick} className="h-12 rounded-2xl border border-[#E5E7EB] bg-white flex-row items-center justify-center gap-2">
                <Ionicons name="cloud-upload-outline" size={18} color="#2E86DE" />
                <Text className="text-[#111827]">{value ? value.name : "בחר/י קובץ להעלאה"}</Text>
            </Pressable>

            {!!helper && <Text className="text-right text-xs text-[#6B7280] mt-2">{helper}</Text>}
        </View>
    );
}
