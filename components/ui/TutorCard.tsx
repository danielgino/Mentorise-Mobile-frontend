import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { ShimmerPlaceholder } from "@/components/ui/ShimmerPlaceholder";
import { LinearGradient } from "expo-linear-gradient";
import { GraduationCap, Sparkles, User } from "lucide-react-native";
import {
    GRADIENT_COLORS_PRIMARY,
    GRADIENT_START,
    GRADIENT_END,
} from "@/constants/theme";

type TutorCardProps = {
    name: string;
    field: string;
    status: "סטודנט" | "בוגר";
    courses: string[];
    description: string;
    image?: string;
    matchReason?: string | null;
};

export function TutorCard({
    name,
    field,
    status,
    courses,
    description,
    image,
    matchReason,
}: TutorCardProps) {
    const visibleCourses = courses.slice(0, 4);
    const overflowCount = courses.length - visibleCourses.length;
    const imgOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        imgOpacity.setValue(0);
    }, [image]);

    return (
        <View style={styles.root}>
            {/*
             * Shadow lives on the outer wrapper.
             * overflow:hidden on the card would clip it, so they must stay separated.
             */}
            <View style={styles.shadowWrap}>
                <View style={styles.card}>

                    {/* ── Photo zone (60 %) ──────────────────────────────── */}
                    <View style={styles.photoZone}>
                        {image ? (
                            <>
                                <ShimmerPlaceholder style={StyleSheet.absoluteFillObject} height="100%" />
                                <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: imgOpacity }]}>
                                    <Image
                                        source={{ uri: image }}
                                        style={styles.photo}
                                        resizeMode="cover"
                                        accessibilityLabel={name}
                                        onLoad={() =>
                                            Animated.timing(imgOpacity, { toValue: 1, duration: 350, useNativeDriver: true }).start()
                                        }
                                    />
                                </Animated.View>
                                <LinearGradient
                                    colors={["transparent", "rgba(0,0,0,0.28)"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 0, y: 1 }}
                                    style={styles.photoScrim}
                                />
                            </>
                        ) : (
                            /* No-photo state: full brand gradient placeholder */
                            <LinearGradient
                                colors={GRADIENT_COLORS_PRIMARY}
                                start={GRADIENT_START}
                                end={GRADIENT_END}
                                style={styles.photoPlaceholder}
                            >
                                <View style={styles.avatarRing}>
                                    <User size={60} color="rgba(255,255,255,0.85)" />
                                </View>
                            </LinearGradient>
                        )}

                        {/* Frosted glass strip — name + field float over the photo */}
                        <View style={styles.glassStrip}>
                            <Text style={styles.nameText} numberOfLines={1}>
                                {name}
                            </Text>
                            <Text style={styles.fieldText} numberOfLines={1}>
                                {field}
                            </Text>
                        </View>
                    </View>

                    {/* ── Content zone (40 %) ────────────────────────────── */}
                    <View style={styles.contentZone}>

                        {/* Status badge */}
                        <View style={styles.badgeRow}>
                            <View style={styles.statusBadge}>
                                <GraduationCap size={13} color="#A66CFF" />
                                <Text style={styles.statusText}>{status}</Text>
                            </View>
                        </View>

                        {/* Course / year chips */}
                        {visibleCourses.length > 0 && (
                            <View style={styles.chipsRow}>
                                {visibleCourses.map((course, idx) => (
                                    <View key={`${course}-${idx}`} style={styles.chip}>
                                        <Text style={styles.chipText} numberOfLines={1}>
                                            {course}
                                        </Text>
                                    </View>
                                ))}
                                {overflowCount > 0 && (
                                    <View style={styles.chipOverflow}>
                                        <Text style={styles.chipOverflowText}>
                                            +{overflowCount}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Bio */}
                        <Text style={styles.bioText} numberOfLines={3}>
                            {description.trim() ? description : "אין תיאור נוסף."}
                        </Text>

                        {/* AI match reason */}
                        {matchReason ? (
                            <View style={styles.matchBox}>
                                <View style={styles.matchIconWrap}>
                                    <Sparkles size={13} color="#2E86DE" />
                                </View>
                                <Text style={styles.matchText}>{matchReason}</Text>
                            </View>
                        ) : null}

                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        paddingHorizontal: 16,
    },

    // Outer wrapper carries the shadow so overflow:hidden on the card doesn't clip it
    shadowWrap: {
        flex: 1,
        maxWidth: 440,
        width: "100%",
        alignSelf: "center",
        // Blue-tinted ambient shadow — creates premium floating depth on white
        shadowColor: "#2E86DE",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.13,
        shadowRadius: 32,
        elevation: 8,
    },

    card: {
        flex: 1,
        borderRadius: 28,
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
        // Hairline border in brand tint separates the white card from the white screen
        borderWidth: 1,
        borderColor: "rgba(46,134,222,0.10)",
    },

    // ── Photo zone ────────────────────────────────────────────────────────────
    photoZone: {
        flex: 3, // ~60 % of card height
    },
    photo: {
        ...StyleSheet.absoluteFillObject,
    },
    photoPlaceholder: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarRing: {
        width: 108,
        height: 108,
        borderRadius: 54,
        backgroundColor: "rgba(255,255,255,0.14)",
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.28)",
        alignItems: "center",
        justifyContent: "center",
    },
    photoScrim: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },

    // Semi-transparent frosted strip pinned to the bottom of the photo zone
    glassStrip: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(255,255,255,0.88)",
        // Fine top edge reads as the "frost line"
        borderTopWidth: 0.5,
        borderTopColor: "rgba(255,255,255,0.55)",
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 14,
        alignItems: "flex-end", // RTL: flush right
    },
    nameText: {
        fontSize: 22,
        fontFamily: "Assistant_700Bold",
        fontWeight: "700",
        color: "#1A1A2E",
        textAlign: "right",
        letterSpacing: -0.3,
    },
    fieldText: {
        fontSize: 13,
        color: "#6B7280",
        textAlign: "right",
        marginTop: 2,
    },

    // ── Content zone ──────────────────────────────────────────────────────────
    contentZone: {
        flex: 2, // ~40 % of card height
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 16,
        gap: 10,
    },

    // Status badge — purple accent, right-aligned (RTL)
    badgeRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    statusBadge: {
        flexDirection: "row-reverse",
        alignItems: "center",
        gap: 5,
        backgroundColor: "rgba(166,108,255,0.10)",
        borderWidth: 1,
        borderColor: "rgba(166,108,255,0.25)",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    statusText: {
        fontSize: 12,
        fontFamily: "Assistant_600SemiBold",
        fontWeight: "600",
        color: "#A66CFF",
    },

    // Course chips — blue accent, light fill
    chipsRow: {
        flexDirection: "row-reverse",
        flexWrap: "wrap",
        gap: 6,
    },
    chip: {
        backgroundColor: "rgba(46,134,222,0.08)",
        borderWidth: 1,
        borderColor: "rgba(46,134,222,0.18)",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    chipText: {
        fontSize: 12,
        fontFamily: "Assistant_500Medium",
        fontWeight: "500",
        color: "#2E86DE",
    },
    chipOverflow: {
        backgroundColor: "rgba(166,108,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(166,108,255,0.18)",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    chipOverflowText: {
        fontSize: 12,
        fontFamily: "Assistant_500Medium",
        fontWeight: "500",
        color: "#A66CFF",
    },

    // Bio
    bioText: {
        fontSize: 13,
        lineHeight: 20,
        color: "#6B7280",
        textAlign: "right",
    },

    // AI match reason — right accent bar, subtle brand fill
    matchBox: {
        flexDirection: "row-reverse",
        alignItems: "flex-start",
        gap: 8,
        backgroundColor: "rgba(46,134,222,0.06)",
        borderRightWidth: 2.5,
        borderRightColor: "#2E86DE",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    matchIconWrap: {
        marginTop: 2,
    },
    matchText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
        color: "#1A1A2E",
        textAlign: "right",
    },
});
