// TrackSelectionScreen.native.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {View, Text, TextInput, FlatList, Pressable, Alert} from "react-native";
import Animated, { FadeInRight, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Search, GraduationCap } from "lucide-react-native";
import { GlassCard } from "@/components/ui/GlassCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { router } from "expo-router";
import { getAllMajorsPublic, type Major } from "@/api/majorsApi";
import { useRegisterDraft } from "@/hooks/RegisterContext";
import {ProgressBar} from "@/components/ui/ProgressBar";
import {ROUTES} from "@/constants/routes";
import {validateStep2} from "@/constants/registerValidators";

export default function TrackSelectionScreen() {
    const [majors, setMajors] = useState<Major[]>([]);
    const [selected, setSelected] = useState<Major | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const { setDraft } = useRegisterDraft();
    const handleContinue = () => {
        const { errors } = validateStep2({ majorId: selected?.id ?? null });

        if (errors.majorId) {
            Alert.alert("שגיאה", errors.majorId);
            return;
        }        setDraft((prev) => ({ ...prev, majorId: selected!.id }));
        router.push({ pathname: ROUTES.ONBOARDING.ACADEMIC_STATUS, params: { mode: "signup" } });
    };
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await getAllMajorsPublic(); // [{ id:number, name:string }]
                if (mounted) setMajors(data);
            } catch (e) {
                if (__DEV__) console.warn("❌ Failed to load majors:", e);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const filtered = useMemo(() => {
        const q = searchQuery.trim();
        if (!q) return majors;
        return majors.filter((m) => m.name.includes(q));
    }, [majors, searchQuery]);

    const renderItem = useCallback(
        ({ item, index }: { item: Major; index: number }) => {
            const isSelected = selected?.id === item.id;
            return (
                <Animated.View entering={FadeInUp.delay(index * 40)} className="px-2">
                    <Pressable onPress={() => setSelected(item)}>
                        <GlassCard className="mb-3" selected={isSelected} onPress={() => setSelected(item)}>
                            <View className="flex-row items-center gap-4">
                                <View className="flex-1">
                                    <Text className="text-[#1A1A2E] text-xl text-right">{item.name}</Text>
                                </View>
                                <View className="w-10 h-10 items-center justify-center rounded-2xl bg-[#F0F4FF] border border-[#E5E7EB]">
                                    <GraduationCap     size={22}
                                                       color="#A66CFF"
                                                       style={{
                                                           shadowColor: '#A66CFF',
                                                           shadowOffset: { width: 0, height: 0 },
                                                           shadowOpacity: 0.9,
                                                           shadowRadius: 8,
                                                           elevation: 8,
                                                       }} />
                                </View>
                            </View>
                        </GlassCard>
                    </Pressable>
                </Animated.View>
            );
        },
        [selected]
    );

    return (
        <Animated.View entering={FadeInRight} className="flex-1 px-6 py-12">
            <ProgressBar total={3} active={2} />

            <View className="items-center mb-6">
                <Text className="text-3xl text-[#1A1A2E] mb-2">בחר את המסלול שלך</Text>
                <Text className="text-[#6B7280] text-lg">באיזה תחום אתה לומד/תרצה ללמד?</Text>
            </View>

            <View className="mb-4">
                <View className="relative">
                    <View className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Search size={18} color="#6B7280" />
                    </View>
                    <TextInput
                        placeholder="חפש מסלול..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="w-full bg-white border border-[#E5E7EB] rounded-2xl px-12 py-4 text-[#1A1A2E]"
                        style={{ textAlign: "right" }}
                    />
                </View>
            </View>

            {/* List */}
            <View className="flex-1 -mx-2">
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 8 }}
                    ListEmptyComponent={
                        <View className="items-center py-12">
                            <Text className="text-[#9CA3AF] text-lg">לא נמצאו מסלולים</Text>
                            <Text className="text-[#9CA3AF] text-sm mt-2">נסה לחפש משהו אחר</Text>
                        </View>
                    }
                    initialNumToRender={8}
                    windowSize={10}
                    removeClippedSubviews
                />
            </View>

            <PrimaryButton disabled={!selected} onPress={handleContinue}>
                המשך
            </PrimaryButton>
        </Animated.View>
    );
}
