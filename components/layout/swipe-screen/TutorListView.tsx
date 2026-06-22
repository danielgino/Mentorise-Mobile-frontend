import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    type NativeSyntheticEvent,
    type NativeScrollEvent,
} from "react-native";
import { type TutorSwipeItem } from "@/api/tutorsSwipeApi";
import { TutorAccordionRow } from "@/components/ui/TutorAccordionRow";

type TutorListViewProps = {
    tutors: TutorSwipeItem[];
    loading: boolean;
    hasMore: boolean;
    onEndReached: () => void;
};

const LOAD_AHEAD_PX = 220;

export function TutorListView({
    tutors,
    loading,
    hasMore,
    onEndReached,
}: TutorListViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const handleToggle = useCallback((id: number) => {
        setExpandedId((prev) => (prev === id ? null : id));
    }, []);

    const handleScroll = useCallback(
        ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const distanceFromBottom =
                contentSize.height - layoutMeasurement.height - contentOffset.y;
            if (distanceFromBottom < LOAD_AHEAD_PX && hasMore && !loading) {
                onEndReached();
            }
        },
        [hasMore, loading, onEndReached]
    );

    if (tutors.length === 0 && !loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#9CA3AF", fontSize: 15 }}>
                    אין מתרגלים להצגה
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: 10, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
        >
            {tutors.map((tutor) => (
                <TutorAccordionRow
                    key={tutor.id}
                    tutor={tutor}
                    isExpanded={expandedId === tutor.id}
                    onToggle={() => handleToggle(tutor.id)}
                />
            ))}

            {/* Footer */}
            {loading ? (
                <View style={{ paddingVertical: 24, alignItems: "center" }}>
                    <ActivityIndicator color="#9CA3AF" />
                </View>
            ) : !hasMore && tutors.length > 0 ? (
                <View style={{ paddingVertical: 24, alignItems: "center" }}>
                    <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
                        · סוף הרשימה ·
                    </Text>
                </View>
            ) : null}
        </ScrollView>
    );
}
