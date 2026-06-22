import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";

export type PickerOption = { value: string; label: string };

type ModalSelectorProps = {
    options: PickerOption[];

    /**
     * "modal"  → dark bottom-sheet single-select (MajorPicker style)
     * "inline" → light inline multi-select buttons (YearSelector style)
     */
    variant?: "modal" | "inline";

    // ── modal variant ─────────────────────────────────────────────────────────
    visible?: boolean;
    onClose?: () => void;
    onSelect?: (value: string | null) => void;
    selectedValue?: string | null;
    title?: string;
    /** Renders a search TextInput above the list */
    searchable?: boolean;
    /** Shows ActivityIndicator instead of list — for async data */
    loading?: boolean;
    /** Renders a "נקה בחירה" button at the bottom */
    clearable?: boolean;

    // ── inline variant ────────────────────────────────────────────────────────
    selectedValues?: string[];
    onToggle?: (value: string) => void;
    disabled?: boolean;
};

export function ModalSelector({
    options,
    variant = "modal",
    visible = false,
    onClose,
    onSelect,
    selectedValue,
    title = "",
    searchable = false,
    loading = false,
    clearable = false,
    selectedValues = [],
    onToggle,
    disabled = false,
}: ModalSelectorProps) {
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        if (!searchable) return options;
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter((o) => o.label.toLowerCase().includes(q));
    }, [options, query, searchable]);

    function handleClose() {
        setQuery("");
        onClose?.();
    }

    // ─── inline variant (YearSelector style) ──────────────────────────────────
    if (variant === "inline") {
        return (
            <View className={`flex-row-reverse gap-3 ${disabled ? "opacity-50" : ""}`}>
                {options.map((opt) => {
                    const active = selectedValues.includes(opt.value);
                    return (
                        <Pressable
                            key={opt.value}
                            onPress={() => !disabled && onToggle?.(opt.value)}
                            className={`flex-1 h-12 rounded-2xl border items-center justify-center ${
                                active
                                    ? "border-[#2E86DE] bg-[#EFF6FF]"
                                    : "border-[#E5E7EB] bg-white"
                            }`}
                        >
                            <Text
                                className={
                                    active ? "text-[#2E86DE] font-bold" : "text-[#111827]"
                                }
                            >
                                {opt.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        );
    }

    // ─── modal variant (MajorPicker style) ────────────────────────────────────
    return (
        <Modal visible={visible} animationType="slide" transparent>
            <Pressable onPress={handleClose} className="flex-1 bg-black/60">
                <Pressable
                    onPress={() => {}}
                    className="mt-auto rounded-t-3xl bg-white p-4 border-t border-[rgba(0,0,0,0.07)]"
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-3">
                        <Pressable onPress={handleClose} className="px-3 py-2">
                            <Text className="text-[#9CA3AF]">סגור</Text>
                        </Pressable>
                        <Text className="text-[#1A1A2E] text-base font-semibold">{title}</Text>
                        <View className="w-12" />
                    </View>

                    {/* Search */}
                    {searchable && (
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder="חפש..."
                            placeholderTextColor="#9CA3AF"
                            className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-[#1A1A2E] text-right"
                            textAlign="right"
                            autoCorrect={false}
                            autoCapitalize="none"
                        />
                    )}

                    {/* List */}
                    <View className="mt-4 mb-6">
                        {loading ? (
                            <View className="py-8">
                                <ActivityIndicator color="#2E86DE" />
                            </View>
                        ) : (
                            <FlatList
                                data={filtered}
                                keyExtractor={(item) => item.value}
                                keyboardShouldPersistTaps="handled"
                                ItemSeparatorComponent={() => (
                                    <View className="h-[1px] bg-[rgba(0,0,0,0.07)] my-1" />
                                )}
                                renderItem={({ item }) => {
                                    const isSelected = item.value === selectedValue;
                                    return (
                                        <Pressable
                                            onPress={() => {
                                                onSelect?.(item.value);
                                                handleClose();
                                            }}
                                            className="px-3 py-4 rounded-2xl"
                                            style={{
                                                backgroundColor: isSelected
                                                    ? "#F0F4FF"
                                                    : "transparent",
                                            }}
                                        >
                                            <Text className="text-right text-[#1A1A2E] text-base">
                                                {item.label}
                                            </Text>
                                        </Pressable>
                                    );
                                }}
                                ListEmptyComponent={() => (
                                    <Text className="text-center text-[#9CA3AF] py-6">
                                        לא נמצאו תוצאות
                                    </Text>
                                )}
                            />
                        )}
                    </View>

                    {/* Clear */}
                    {clearable && (
                        <Pressable
                            onPress={() => {
                                onSelect?.(null);
                                handleClose();
                            }}
                            className="rounded-2xl border border-[#E5E7EB] bg-[#F0F4FF] px-4 py-3"
                        >
                            <Text className="text-center text-[#6B7280]">נקה בחירה</Text>
                        </Pressable>
                    )}
                </Pressable>
            </Pressable>
        </Modal>
    );
}
