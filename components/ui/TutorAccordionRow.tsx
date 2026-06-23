import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    Pressable,
    Alert,
    ActivityIndicator,
    LayoutAnimation,
    Platform,
    UIManager,
    StyleSheet,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronDown, Sparkles, MessageCircle, User } from "lucide-react-native";
import { GRADIENT_COLORS_PRIMARY } from "@/constants/theme";
import { useRouter } from "expo-router";
import { type TutorSwipeItem } from "@/api/tutorsSwipeApi";
import { getOrCreateConversation } from "@/api/chatApi";
import { ROUTES } from "@/constants/routes";

const loadedListImages = new Set<string>();

// LayoutAnimation requires this flag on Android
if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ─── Types ────────────────────────────────────────────────────────────────────

type TutorAccordionRowProps = {
    tutor: TutorSwipeItem;
    isExpanded: boolean;
    onToggle: () => void;
};

type ExpandedContentProps = {
    tutor: TutorSwipeItem;
    courses: string[];
    creatingChat: boolean;
    onStartChat: () => void;
    onViewProfile: () => void;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CHEVRON_TIMING = { duration: 220, easing: Easing.out(Easing.cubic) };

// Native layout animation — runs on the UI thread, integrates cleanly with
// ScrollView so surrounding rows animate without a jump or flicker.
const LAYOUT_ANIM = {
    duration: 280,
    create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
    },
    update: {
        type: LayoutAnimation.Types.easeInEaseOut,
    },
    delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
    },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] ?? "") + (parts[1][0] ?? "");
    return parts[0]?.[0] ?? "?";
}

// ─── Expanded content ─────────────────────────────────────────────────────────

function ExpandedContent({
    tutor,
    courses,
    creatingChat,
    onStartChat,
    onViewProfile,
}: ExpandedContentProps) {
    return (
        <View style={{ paddingHorizontal: 14, paddingTop: 4, paddingBottom: 18 }}>

            {/* Bio */}
            {tutor.bio?.trim() ? (
                <Text
                    style={{
                        color: "#6B7280",
                        fontSize: 13,
                        lineHeight: 20,
                        textAlign: "right",
                        marginBottom: 14,
                    }}
                >
                    {tutor.bio}
                </Text>
            ) : null}

            {/* Full course pills — Bug 2 fix:
                flexShrink + maxWidth on each gradient so long names
                don't overflow; numberOfLines truncates gracefully. */}
            <View
                style={{
                    flexDirection: "row-reverse",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 14,
                }}
            >
                {courses.map((course, idx) => (
                    <View
                        key={`${course}-${idx}`}
                        style={{
                            borderRadius: 999,
                            flexShrink: 1,
                            maxWidth: "100%",
                            paddingHorizontal: 12,
                            paddingVertical: 4,
                            borderWidth: 1,
                            borderColor: "rgba(0,0,0,0.07)",
                            backgroundColor: "#F0F4FF",
                        }}
                    >
                        <Text
                            numberOfLines={1}
                            style={{
                                color: "#6B7280",
                                fontSize: 12,
                                textAlign: "right",
                            }}
                        >
                            {course}
                        </Text>
                    </View>
                ))}
            </View>

            {/* AI match reason */}
            {tutor.matchReason ? (
                <View
                    style={{
                        flexDirection: "row-reverse",
                        alignItems: "flex-start",
                        backgroundColor: "rgba(46,134,222,0.06)",
                        borderRightWidth: 2.5,
                        borderRightColor: "#2E86DE",
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        gap: 8,
                        marginBottom: 16,
                    }}
                >
                    <View style={{ marginTop: 2 }}>
                        <Sparkles size={14} color="#2E86DE" />
                    </View>
                    <Text
                        style={{
                            flex: 1,
                            fontSize: 13,
                            lineHeight: 19,
                            color: "#6B7280",
                            textAlign: "right",
                        }}
                    >
                        {tutor.matchReason}
                    </Text>
                </View>
            ) : null}

            {/* Action buttons */}
            <View style={{ flexDirection: "row-reverse", gap: 10 }}>
                {/* Primary — התחל שיחה */}
                <Pressable
                    onPress={onStartChat}
                    disabled={creatingChat}
                    style={{ flex: 1, borderRadius: 999, overflow: "hidden" }}
                >
                    <LinearGradient
                        colors={GRADIENT_COLORS_PRIMARY}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={{
                            paddingVertical: 12,
                            flexDirection: "row-reverse",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                        }}
                    >
                        {creatingChat ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <MessageCircle size={15} color="#fff" />
                        )}
                        <Text style={{ color: "#fff", fontFamily: "Assistant_600SemiBold", fontWeight: "600", fontSize: 14 }}>
                            {creatingChat ? "פותח..." : "התחל שיחה"}
                        </Text>
                    </LinearGradient>
                </Pressable>

                {/* Secondary — פרופיל מלא */}
                <Pressable
                    onPress={onViewProfile}
                    style={{
                        flex: 1,
                        borderRadius: 999,
                        paddingVertical: 12,
                        flexDirection: "row-reverse",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        backgroundColor: "#F0F4FF",
                        borderWidth: 1,
                        borderColor: "rgba(0,0,0,0.07)",
                    }}
                >
                    <User size={15} color="#6B7280" />
                    <Text style={{ color: "#6B7280", fontFamily: "Assistant_600SemiBold", fontWeight: "600", fontSize: 14 }}>
                        פרופיל מלא
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TutorAccordionRow({ tutor, isExpanded, onToggle }: TutorAccordionRowProps) {
    const router = useRouter();
    const [creatingChat, setCreatingChat] = useState(false);

    const avatarOpacity = useSharedValue(
        Boolean(tutor.tutorImageUrl && loadedListImages.has(tutor.tutorImageUrl)) ? 1 : 0
    );
    const avatarStyle = useAnimatedStyle(() => ({ opacity: avatarOpacity.value }));

    // Chevron rotation only — height animation is handled by LayoutAnimation
    const chevronProgress = useSharedValue(isExpanded ? 1 : 0);

    const chevronStyle = useAnimatedStyle(() => ({
        transform: [
            {
                rotate: interpolate(chevronProgress.value, [0, 1], [0, 180]) + "deg",
            },
        ],
    }));

    useEffect(() => {
        chevronProgress.value = withTiming(isExpanded ? 1 : 0, CHEVRON_TIMING);
    }, [isExpanded]);

    const courses = tutor.courses?.length
        ? tutor.courses
        : tutor.years?.length
        ? tutor.years.map((y) => `שנה ${y}`)
        : [`מתרגל בכל תחומי ${tutor.majorName}`];

    const collapsedCourses = courses.slice(0, 3);
    const overflowCount = courses.length - collapsedCourses.length;

    const onStartChat = async () => {
        if (creatingChat) return;
        try {
            setCreatingChat(true);
            const result = await getOrCreateConversation(tutor.id);
            router.push({
                pathname: "/chat/[id]",
                params: {
                    id: String(result.conversationId),
                    otherUserId: String(tutor.id),
                    otherUserName: tutor.fullName,
                },
            });
        } catch {
            Alert.alert("שגיאה", "לא הצלחנו לפתוח את השיחה כרגע");
        } finally {
            setCreatingChat(false);
        }
    };

    const onViewProfile = () => {
        router.push({
            pathname: ROUTES.TUTOR_PROFILE,
            params: { id: tutor.id },
        });
    };

    return (
        <View
            style={{
                marginHorizontal: 16,
                marginBottom: 10,
                borderRadius: 20,
                overflow: "hidden",
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: isExpanded
                    ? "rgba(46,134,222,0.25)"
                    : "rgba(0,0,0,0.07)",
                borderRightWidth: isExpanded ? 2.5 : 1,
                borderRightColor: isExpanded ? "#2E86DE" : "rgba(0,0,0,0.07)",
            }}
        >
            {/* ── Collapsed row (always visible) ───────────────────────────── */}
            <Pressable
                onPress={() => {
                    // configureNext must be called synchronously before the
                    // state change that causes the layout diff
                    LayoutAnimation.configureNext(LAYOUT_ANIM);
                    onToggle();
                }}
                style={{
                    flexDirection: "row-reverse",
                    alignItems: "center",
                    paddingHorizontal: 14,
                    paddingVertical: 13,
                    gap: 12,
                }}
            >
                {/* Avatar */}
                <View style={{ width: 44, height: 44, borderRadius: 22, overflow: "hidden" }}>
                    <LinearGradient
                        colors={GRADIENT_COLORS_PRIMARY}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[StyleSheet.absoluteFillObject, { alignItems: "center", justifyContent: "center" }]}
                    >
                        <Text style={{ color: "#fff", fontFamily: "Assistant_700Bold", fontWeight: "700", fontSize: 15 }}>
                            {getInitials(tutor.fullName)}
                        </Text>
                    </LinearGradient>
                    {tutor.tutorImageUrl ? (
                        <Animated.View style={[StyleSheet.absoluteFillObject, avatarStyle]}>
                            <Image
                                source={{ uri: tutor.tutorImageUrl }}
                                style={{ width: 44, height: 44 }}
                                resizeMode="cover"
                                onLoad={() => {
                                    if (tutor.tutorImageUrl) loadedListImages.add(tutor.tutorImageUrl);
                                    avatarOpacity.value = withTiming(1, { duration: 300 });
                                }}
                            />
                        </Animated.View>
                    ) : null}
                </View>

                {/* Name + field + course preview */}
                <View style={{ flex: 1, minWidth: 0 }}>
                    {/* Name row */}
                    <View
                        style={{
                            flexDirection: "row-reverse",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 3,
                        }}
                    >
                        <Text
                            numberOfLines={1}
                            style={{
                                color: "#1A1A2E",
                                fontFamily: "Assistant_700Bold",
                                fontWeight: "700",
                                fontSize: 15,
                                textAlign: "right",
                                flexShrink: 1,
                            }}
                        >
                            {tutor.fullName}
                        </Text>

                        {/* Status chip */}
                        <View
                            style={{
                                backgroundColor: "rgba(46,134,222,0.10)",
                                borderWidth: 1,
                                borderColor: "rgba(46,134,222,0.20)",
                                borderRadius: 999,
                                paddingHorizontal: 7,
                                paddingVertical: 2,
                            }}
                        >
                            <Text style={{ color: "#2E86DE", fontSize: 11, fontFamily: "Assistant_600SemiBold", fontWeight: "600" }}>
                                {tutor.isAlumni ? "בוגר" : "סטודנט"}
                            </Text>
                        </View>
                    </View>

                    {/* Major */}
                    <Text
                        numberOfLines={1}
                        style={{
                            color: "#9CA3AF",
                            fontSize: 12,
                            textAlign: "right",
                            marginBottom: 7,
                        }}
                    >
                        {tutor.majorName}
                    </Text>

                    {/* Collapsed course pills — Bug 2 fix:
                        flexWrap lets long names wrap instead of bleeding out;
                        flexShrink + minWidth: 0 allows each pill to compress. */}
                    <View
                        style={{
                            flexDirection: "row-reverse",
                            flexWrap: "wrap",
                            alignItems: "center",
                            gap: 5,
                        }}
                    >
                        {collapsedCourses.map((course, idx) => (
                            <View
                                key={`${course}-${idx}`}
                                style={{
                                    flexShrink: 1,
                                    minWidth: 0,
                                    backgroundColor: "#F0F4FF",
                                    borderRadius: 999,
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderWidth: 1,
                                    borderColor: "rgba(0,0,0,0.06)",
                                }}
                            >
                                <Text
                                    numberOfLines={1}
                                    style={{ color: "#6B7280", fontSize: 11 }}
                                >
                                    {course}
                                </Text>
                            </View>
                        ))}
                        {overflowCount > 0 && (
                            <View
                                style={{
                                    backgroundColor: "#F8F9FC",
                                    borderRadius: 999,
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                }}
                            >
                                <Text style={{ color: "#9CA3AF", fontSize: 11 }}>
                                    +{overflowCount}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Animated chevron */}
                <Animated.View style={chevronStyle}>
                    <ChevronDown size={18} color="#9CA3AF" />
                </Animated.View>
            </Pressable>

            {/* ── Expanded content — conditional render, height driven by
                LayoutAnimation rather than a manually animated value ───────── */}
            {isExpanded && (
                <ExpandedContent
                    tutor={tutor}
                    courses={courses}
                    creatingChat={creatingChat}
                    onStartChat={onStartChat}
                    onViewProfile={onViewProfile}
                />
            )}
        </View>
    );
}
