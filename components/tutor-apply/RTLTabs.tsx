import { Pressable, Text, View } from "react-native";

export type TabId = "courses" | "years" | "all";
export type TabItem = { id: TabId; label: string };

export default function RTLTabs({
                                    tabs,
                                    activeTab,
                                    onChange,
                                }: {
    tabs: TabItem[];
    activeTab: TabId;
    onChange: (id: TabId) => void;
}) {
    return (
        <View className="flex-row border-b border-[#E5E7EB]">
            {tabs.map((t) => {
                const active = t.id === activeTab;
                return (
                    <Pressable
                        key={t.id}
                        onPress={() => onChange(t.id)}
                        className="flex-1 items-center py-3"
                    >
                        <Text className={`text-sm ${active ? "text-[#111827] font-bold" : "text-[#6B7280]"}`}>
                            {t.label}
                        </Text>
                        <View className={`mt-2 h-[2px] w-full ${active ? "bg-[#2E86DE]" : "bg-transparent"}`} />
                    </Pressable>
                );
            })}
        </View>
    );
}
