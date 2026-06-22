import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type Course = {
    id: number;
    name: string;
    code: string;
    year: string;
    semester: string;
};

export default function CourseListItem({
                                           course,
                                           selected,
                                           onToggle,
                                       }: {
    course: Course;
    selected: boolean;
    onToggle: () => void;
}) {
    return (
        <Pressable onPress={onToggle} className="flex-row items-center gap-3 px-4 py-4 border-b border-[#E5E7EB] bg-white">
            <View className={`w-5 h-5 rounded-md border ${selected ? "bg-[#2E86DE] border-[#2E86DE]" : "border-[#D1D5DB]" } items-center justify-center`}>
                {selected && <Ionicons name="checkmark" size={14} color="white" />}
            </View>

            <View className="flex-1">
                <Text className="text-right font-bold text-[#111827]">{course.name}</Text>
                <Text className="text-right text-xs text-[#6B7280] mt-1">
                    קוד קורס: {course.code} · {course.year} · {course.semester}
                </Text>
            </View>
        </Pressable>
    );
}
