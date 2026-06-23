import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
    View,
    Text,
    Pressable,
    Dimensions,
    ActivityIndicator,
    PanResponder,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { TutorCard } from "@/components/ui/TutorCard";
import { ShimmerPlaceholder } from "@/components/ui/ShimmerPlaceholder";
import { ViewToggle, type ViewMode } from "@/components/layout/swipe-screen/ViewToggle";
import { TutorListView } from "@/components/layout/swipe-screen/TutorListView";
import { getSwipeTutors, type TutorSwipeItem } from "@/api/tutorsSwipeApi";
import { useSwipeStore } from "@/store/swipeStore.ts";
import { ROUTES } from "@/constants/routes";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const SWIPE_THRESHOLD = Math.min(140, SCREEN_W * 0.3);
// Minimum fling speed (px/ms) to trigger a throw even below position threshold
const FLING_VELOCITY = 1.2;

export default function HomeSwipe() {
    const router = useRouter();
    const initialTutors = useSwipeStore((s) => s.initialTutors);
    const initialNextCursor = useSwipeStore((s) => s.initialNextCursor);
    const initialHasMore = useSwipeStore((s) => s.initialHasMore);
    const clearInitial = useSwipeStore((s) => s.clear);

    const [viewMode, setViewMode] = useState<ViewMode>("swipe");

    const [tutors, setTutors] = useState<TutorSwipeItem[]>([]);
    const [index, setIndex] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const [excludeIds, setExcludeIds] = useState<number[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const currentTutor = tutors[index] ?? null;

    // ─── Animation values ────────────────────────────────────────────────────
    const x = useSharedValue(0);
    const y = useSharedValue(0);          // ← NEW: vertical axis
    const rotateDeg = useMemo(() => 18, []);
    const SWIPE_MS = 250;

    const cardStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            x.value,
            [-SCREEN_W / 2, SCREEN_W / 2],
            [-rotateDeg, rotateDeg]
        );
        // Fade based on distance from centre (not just horizontal)
        const dist = Math.sqrt(x.value * x.value + y.value * y.value);
        const opacity = interpolate(dist, [0, SCREEN_W * 0.75], [1, 0]);

        return {
            transform: [
                { translateX: x.value },
                { translateY: y.value },   // ← NEW
                { rotate: `${rotate}deg` },
            ],
            opacity,
        };
    });

    // ─── Timers ───────────────────────────────────────────────────────────────
    const isFetchingRef = useRef(false);
    const t1Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
    const t2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (t1Ref.current) clearTimeout(t1Ref.current);
            if (t2Ref.current) clearTimeout(t2Ref.current);
        };
    }, []);

    // ─── Data fetching ────────────────────────────────────────────────────────
    const fetchMore = useCallback(
        async (mode: "append" | "reset") => {
            if (isFetchingRef.current) return;

            isFetchingRef.current = true;
            setLoading(true);
            setError(null);

            try {
                const limit = 10;
                const cursor = mode === "reset" ? null : nextCursor;
                const exclude = mode === "reset" ? [] : excludeIds;

                const resp = await getSwipeTutors({ limit, cursor, excludeIds: exclude });

                if (mode === "reset") {
                    setTutors(resp.items);
                    setIndex(0);
                } else {
                    setTutors((prev) => [...prev, ...resp.items]);
                }

                setNextCursor(resp.nextCursor);
                setHasMore(resp.hasMore);
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "שגיאה לא ידועה");
            } finally {
                isFetchingRef.current = false;
                setLoading(false);
                setInitialized(true);
            }
        },
        [nextCursor, excludeIds]
    );

    useEffect(() => {
        if (initialTutors && initialTutors.length > 0) {
            setTutors(initialTutors);
            setIndex(0);
            setNextCursor(initialNextCursor);
            setHasMore(initialHasMore);
            setInitialized(true);
            clearInitial();
            return;
        }
        fetchMore("reset");
    }, []);

    useEffect(() => {
        if (tutors.length === 0) return;
        const remaining = tutors.length - index;
        const shouldLoad = remaining <= 3 && !loading && (hasMore || !!nextCursor);
        if (shouldLoad) fetchMore("append");
    }, [tutors.length, index, loading, hasMore, nextCursor, fetchMore]);

    // ─── Swipe helpers ────────────────────────────────────────────────────────
    const markExcluded = useCallback((id: number) => {
        setExcludeIds((prev) => {
            if (prev.includes(id)) return prev;
            if (prev.length >= 50) return prev;
            return [...prev, id];
        });
    }, []);

    /**
     * Animate the card flying off in the direction the user threw it.
     *
     * @param direction  "left" | "right" – determines match / skip
     * @param shouldMatch  whether to navigate to the match screen
     * @param vx  horizontal velocity from the gesture (px/ms); 0 for button taps
     * @param vy  vertical velocity from the gesture (px/ms); 0 for button taps
     */
    const handleSwipe = useCallback(
        (
            direction: "left" | "right",
            shouldMatch: boolean,
            vx = 0,
            vy = 0,
        ) => {
            if (!currentTutor || isAnimating) return;

            const tutorToProcess = { ...currentTutor };
            setIsAnimating(true);
            markExcluded(tutorToProcess.id);

            // ── Calculate exit point ──────────────────────────────────────────
            // We project the velocity vector until the card is guaranteed off-screen.
            const speed = Math.sqrt(vx * vx + vy * vy);

            let toX: number;
            let toY: number;

            if (speed > 0.1) {
                // Real throw – fly in the direction of the gesture velocity.
                // Scale factor: make sure we travel at least 2.5× the screen width.
                const minDist = Math.max(SCREEN_W, SCREEN_H) * 2.5;
                const scale = minDist / speed;

                // Keep the horizontal sign consistent with the chosen direction
                // (e.g. if vx is tiny but direction is "right", still exit right).
                const signedVx = direction === "right" ? Math.abs(vx) || 1 : -(Math.abs(vx) || 1);

                toX = x.value + signedVx * scale;
                toY = y.value + vy * scale;
            } else {
                // Button tap – plain horizontal exit, no vertical movement.
                toX = direction === "right" ? SCREEN_W * 1.5 : -SCREEN_W * 1.5;
                toY = 0;
            }

            x.value = withTiming(toX, { duration: SWIPE_MS });
            y.value = withTiming(toY, { duration: SWIPE_MS });

            if (t1Ref.current) clearTimeout(t1Ref.current);
            if (t2Ref.current) clearTimeout(t2Ref.current);

            t1Ref.current = setTimeout(() => {
                setIndex((prev) => prev + 1);

                requestAnimationFrame(() => {
                    x.value = 0;
                    y.value = 0;
                });

                t2Ref.current = setTimeout(() => {
                    setIsAnimating(false);

                    if (shouldMatch) {
                        router.push({
                            pathname: ROUTES.MATCH,
                            params: {
                                id: tutorToProcess.id,
                                name: tutorToProcess.fullName,
                                field: tutorToProcess.majorName,
                                courses: tutorToProcess.courses.join(","),
                            },
                        });
                    }
                }, 50);
            }, SWIPE_MS);
        },
        [currentTutor, isAnimating, x, y, markExcluded, router]
    );

    const onViewProfile = useCallback(() => {
        if (!currentTutor) return;
        router.push({
            pathname: ROUTES.TUTOR_PROFILE,
            params: { id: currentTutor.id },
        });
    }, [currentTutor, router]);

    // ─── Pan responder ────────────────────────────────────────────────────────
    const panResponder = useMemo(
        () =>
            PanResponder.create({
                // Claim every touch so we can distinguish tap vs swipe on release
                onStartShouldSetPanResponder: () => !isAnimating,

                onMoveShouldSetPanResponder: (_, g) => {
                    if (isAnimating) return false;
                    return Math.sqrt(g.dx * g.dx + g.dy * g.dy) > 6;
                },

                onPanResponderMove: (_, g) => {
                    if (isAnimating) return;
                    x.value = g.dx;
                    y.value = g.dy;
                },

                onPanResponderRelease: (_, g) => {
                    if (!currentTutor || isAnimating) {
                        x.value = withSpring(0, { damping: 14, stiffness: 180 });
                        y.value = withSpring(0, { damping: 14, stiffness: 180 });
                        return;
                    }

                    // Tap — negligible movement → open full profile
                    if (Math.abs(g.dx) < 10 && Math.abs(g.dy) < 10) {
                        x.value = 0;
                        y.value = 0;
                        onViewProfile();
                        return;
                    }

                    const absX = Math.abs(x.value);
                    const speed = Math.sqrt(g.vx * g.vx + g.vy * g.vy);

                    // Trigger swipe if: enough displacement OR fast enough fling
                    const isHorizontalSwipe =
                        absX > SWIPE_THRESHOLD ||
                        (absX > SWIPE_THRESHOLD * 0.4 && speed > FLING_VELOCITY);

                    if (isHorizontalSwipe) {
                        const direction = x.value > 0 ? "right" : "left";
                        handleSwipe(direction, direction === "right", g.vx, g.vy);
                        return;
                    }

                    // Snap back
                    x.value = withSpring(0, { damping: 14, stiffness: 180 });
                    y.value = withSpring(0, { damping: 14, stiffness: 180 });
                },

                onPanResponderTerminate: () => {
                    x.value = withSpring(0, { damping: 14, stiffness: 180 });
                    y.value = withSpring(0, { damping: 14, stiffness: 180 });
                },
            }),
    [isAnimating, currentTutor, handleSwipe, onViewProfile, x, y]
    );

    // ─── Button handlers ──────────────────────────────────────────────────────
    const onRestart = useCallback(() => {
        if (t1Ref.current) clearTimeout(t1Ref.current);
        if (t2Ref.current) clearTimeout(t2Ref.current);

        setExcludeIds([]);
        setNextCursor(null);
        setHasMore(true);
        setIsAnimating(false);
        x.value = 0;
        y.value = 0;
        fetchMore("reset");
    }, [fetchMore, x, y]);

    const showSkeleton = !initialized;
    const showEmpty = initialized && !loading && !currentTutor;
    const showLoadingMore = initialized && loading && !currentTutor;

    const displayCoursesOrYears = (t: TutorSwipeItem): string[] => {
        if (t.courses?.length) return t.courses;
        if (t.years?.length) return t.years.map((y) => `שנה ${y}`);
        return [`מתרגל בכל תחומי ${t.majorName}`];
    };

    // ─── Main render ──────────────────────────────────────────────────────────
    return (
        <View className="flex-1">

            {/* ── Toggle header ──────────────────────────────────────────── */}
            <View style={{ paddingTop: 20, paddingBottom: 10, alignItems: "center" }}>
                <ViewToggle value={viewMode} onChange={setViewMode} />
            </View>

            {/* Error banner */}
            {error ? (
                <View className="px-6 pb-2">
                    <Text className="text-[#6B7280] text-right">{error}</Text>
                </View>
            ) : null}

            {/* ── Swipe view ─────────────────────────────────────────────── */}
            {viewMode === "swipe" ? (
                showSkeleton ? (
                    /* ── Initial loading: skeleton card ─────────────────────── */
                    <View style={{ flex: 1, paddingHorizontal: 16 }}>
                        <View style={{ alignItems: "center", paddingBottom: 6 }}>
                            <View style={{ height: 18 }} />
                        </View>
                        <View style={{
                            flex: 1,
                            maxWidth: 440,
                            width: "100%",
                            alignSelf: "center",
                            shadowColor: "#2E86DE",
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.13,
                            shadowRadius: 32,
                            elevation: 8,
                        }}>
                            <View style={{
                                flex: 1,
                                borderRadius: 28,
                                overflow: "hidden",
                                backgroundColor: "#FFFFFF",
                                borderWidth: 1,
                                borderColor: "rgba(46,134,222,0.10)",
                            }}>
                                {/* Photo zone skeleton */}
                                <View style={{ flex: 3 }}>
                                    <ShimmerPlaceholder width="100%" height="100%" baseColor="#E6EFFD" />
                                    <View style={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        backgroundColor: "rgba(255,255,255,0.92)",
                                        paddingHorizontal: 20,
                                        paddingTop: 12,
                                        paddingBottom: 14,
                                        alignItems: "flex-end",
                                        gap: 8,
                                    }}>
                                        <ShimmerPlaceholder width="52%" height={18} borderRadius={6} baseColor="#EAF2FF" />
                                        <ShimmerPlaceholder width="34%" height={12} borderRadius={4} baseColor="#EEF5FF" />
                                    </View>
                                </View>
                                {/* Content zone skeleton */}
                                <View style={{
                                    flex: 2,
                                    paddingHorizontal: 20,
                                    paddingTop: 14,
                                    paddingBottom: 16,
                                    gap: 12,
                                }}>
                                    <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                        <ShimmerPlaceholder width={72} height={22} borderRadius={999} baseColor="#EDE8FF" />
                                    </View>
                                    <View style={{ flexDirection: "row-reverse", gap: 6 }}>
                                        <ShimmerPlaceholder width={80} height={24} borderRadius={999} baseColor="#EAF2FF" />
                                        <ShimmerPlaceholder width={68} height={24} borderRadius={999} baseColor="#EAF2FF" />
                                        <ShimmerPlaceholder width={56} height={24} borderRadius={999} baseColor="#EAF2FF" />
                                    </View>
                                    <ShimmerPlaceholder width="100%" height={12} borderRadius={4} baseColor="#EEF4FF" />
                                    <ShimmerPlaceholder width="78%" height={12} borderRadius={4} baseColor="#EEF4FF" />
                                    <ShimmerPlaceholder width="55%" height={12} borderRadius={4} baseColor="#EEF4FF" />
                                </View>
                            </View>
                        </View>
                    </View>
                ) : showLoadingMore ? (
                    /* ── Swiped through all cards, fetching next batch ───────── */
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#2E86DE" />
                    </View>
                ) : showEmpty ? (
                    /* ── Genuinely no more tutors ────────────────────────────── */
                    <View className="flex-1 items-center justify-center px-6">
                        <View className="items-center">
                            <Text className="text-2xl text-[#1A1A2E] mb-2 text-center">
                                סיימנו את המתרגלים
                            </Text>
                            {error ? (
                                <Text className="text-[#6B7280] text-center mb-3">{error}</Text>
                            ) : (
                                <Text className="text-[#6B7280] text-center mb-3">
                                    כרגע אין עוד מתרגלים להצגה
                                </Text>
                            )}
                            <Pressable
                                onPress={onRestart}
                                className="px-5 py-3 rounded-full bg-[#F0F4FF] border border-[rgba(46,134,222,0.20)]"
                            >
                                <Text className="text-[#2E86DE]">התחל סבב חדש</Text>
                            </Pressable>
                        </View>
                    </View>
                ) : (
                    /* ── Card stack ──────────────────────────────────────────── */
                    <View className="flex-1 relative overflow-hidden">
                        {/* Counter */}
                        <View style={{ alignItems: "center", paddingBottom: 6 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                {loading ? (
                                    <ActivityIndicator size="small" color="#9CA3AF" />
                                ) : null}
                                <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                                    {Math.min(index + 1, tutors.length)} / {tutors.length}
                                </Text>
                            </View>
                        </View>

                        {/* Card stack — stable keys keep native Image views alive across swipes */}
                        {([tutors[index + 1], tutors[index]] as (TutorSwipeItem | undefined)[])
                            .filter((t): t is TutorSwipeItem => !!t)
                            .map((tutor, stackPos, arr) => {
                                const isForeground = stackPos === arr.length - 1;
                                return (
                                    <Animated.View
                                        key={tutor.id}
                                        className="absolute inset-0"
                                        style={isForeground ? cardStyle : undefined}
                                        pointerEvents={isForeground ? "auto" : "none"}
                                        {...(isForeground ? panResponder.panHandlers : {})}
                                    >
                                        <View className="flex-1">
                                            <TutorCard
                                                name={tutor.fullName}
                                                field={tutor.majorName}
                                                status={tutor.isAlumni ? "בוגר" : "סטודנט"}
                                                courses={displayCoursesOrYears(tutor)}
                                                description={tutor.bio ?? ""}
                                                image={tutor.tutorImageUrl ?? undefined}
                                                matchReason={tutor.matchReason}
                                            />
                                        </View>
                                    </Animated.View>
                                );
                            })
                        }
                    </View>
                )
            ) : (
                /* ── List view ───────────────────────────────────────────── */
                <TutorListView
                    tutors={tutors}
                    loading={loading}
                    hasMore={hasMore}
                    onEndReached={() => fetchMore("append")}
                />
            )}

        </View>
    );
}