import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated as RNAnimated,
    View,
    Text,
    Pressable,
    ScrollView,
    ActivityIndicator,
    Image,
    ImageBackground,
    StyleSheet,
} from "react-native";
import { ShimmerPlaceholder } from "@/components/ui/ShimmerPlaceholder";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, GraduationCap, Star, Calendar, BookOpen, User } from "lucide-react-native";
import { getTutorProfile } from "@/api/tutorApplicationsApi";
import { TutorProfile } from "@/types/tutor";
import { GRADIENT_COLORS_PRIMARY } from "@/constants/theme";

export default function TutorProfileScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();

    const userId = useMemo(() => {
        if (!id) return null;
        const n = Number(id);
        return Number.isFinite(n) ? n : null;
    }, [id]);

    const [tutor, setTutor] = useState<TutorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userId === null) {
            setError("ID לא תקין");
            setLoading(false);
            return;
        }

        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                setError(null);
                const dto = await getTutorProfile(userId);
                if (mounted) setTutor(dto);
            } catch (e: any) {
                if (mounted) setError(e?.message ?? "שגיאה בטעינת פרופיל");
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, [id, userId]);

    const onBack = () => router.back();

    const labels = useMemo(() => {
        if (!tutor) return [];
        if (tutor.courses.length > 0) return tutor.courses;
        if (tutor.years.length > 0) return tutor.years.map((y) => `שנה ${y}`);
        return [`כללי במסלול ${tutor.majorName}`];
    }, [tutor]);

    const statusText = useMemo(() => {
        if (!tutor) return "";
        return tutor.alumni ? "בוגר" : "סטודנט";
    }, [tutor]);

    const ratingText = useMemo(() => {
        if (!tutor) return "";
        if (tutor.ratingAvg === null) return "חדש";
        return String(Math.round(tutor.ratingAvg * 10) / 10);
    }, [tutor]);

    const hasTutorImage = useMemo(() => !!tutor?.tutorImageUrl?.trim(), [tutor]);
    const hasProfileImage = useMemo(() => !!tutor?.profileImageUrl?.trim(), [tutor]);

    const bannerOpacity = useRef(new RNAnimated.Value(0)).current;
    const avatarOpacity = useRef(new RNAnimated.Value(0)).current;

    useEffect(() => {
        bannerOpacity.setValue(0);
        avatarOpacity.setValue(0);
    }, [tutor]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F8F9FC]">
                <ActivityIndicator size="large" color="#2E86DE" />
            </View>
        );
    }

    if (error || !tutor) {
        return (
            <View className="flex-1 items-center justify-center px-6 gap-4 bg-[#F8F9FC]">
                <Text className="text-[#6B7280] text-center text-base">
                    {error ?? "לא נמצא פרופיל"}
                </Text>
                <Pressable onPress={onBack} className="overflow-hidden rounded-lg">
                    <LinearGradient
                        colors={GRADIENT_COLORS_PRIMARY}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ paddingHorizontal: 28, paddingVertical: 14 }}
                    >
                        <Text className="text-white font-bold text-base">חזרה</Text>
                    </LinearGradient>
                </Pressable>
            </View>
        );
    }

    return (
        <Animated.View
            entering={FadeInRight.duration(220)}
            exiting={FadeOutLeft.duration(220)}
            className="flex-1 bg-[#F8F9FC]"
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* ─── Hero Banner ─── */}
                <View style={{ height: 300 }} className="relative">
                    {hasTutorImage ? (
                        <>
                            <ShimmerPlaceholder width="100%" height={300} />
                            <RNAnimated.View style={[StyleSheet.absoluteFillObject, { opacity: bannerOpacity }]}>
                                <ImageBackground
                                    source={{ uri: tutor.tutorImageUrl! }}
                                    resizeMode="cover"
                                    style={{ position: "absolute", inset: 0 }}
                                    onLoad={() =>
                                        RNAnimated.timing(bannerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start()
                                    }
                                >
                                    <LinearGradient
                                        colors={["rgba(248,249,252,0.00)", "rgba(248,249,252,0.20)", "rgba(248,249,252,0.85)"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 0, y: 1 }}
                                        style={{ position: "absolute", inset: 0 }}
                                    />
                                </ImageBackground>
                            </RNAnimated.View>
                        </>
                    ) : (
                        <LinearGradient
                            colors={["#EFF6FF", "#F0F4FF"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ position: "absolute", inset: 0 }}
                        >
                            <LinearGradient
                                colors={["rgba(46,134,222,0.08)", "transparent", "rgba(166,108,255,0.06)"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ position: "absolute", inset: 0 }}
                            />
                        </LinearGradient>
                    )}

                    {/* Back button */}
                    <View className="absolute top-14 right-5 z-10">
                        <Pressable
                            onPress={onBack}
                            className="w-11 h-11 rounded-full overflow-hidden items-center justify-center"
                            style={{ backgroundColor: "rgba(255,255,255,0.90)", borderWidth: 1, borderColor: "rgba(0,0,0,0.10)" }}
                        >
                            <ArrowRight size={20} color="#1A1A2E" />
                        </Pressable>
                    </View>

                    {/* Rating badge top-left */}
                    <View className="absolute top-14 left-5 z-10">
                        <View
                            className="flex-row-reverse items-center gap-1.5 px-4 py-2 rounded-full"
                            style={{ backgroundColor: "rgba(255,255,255,0.90)", borderWidth: 1, borderColor: "rgba(0,0,0,0.10)" }}
                        >
                            <Star size={16} color="#2E86DE" fill="#2E86DE" />
                            <Text className="text-base font-bold text-[#1A1A2E]">{ratingText}</Text>
                        </View>
                    </View>

                    {/* Avatar */}
                    <View className="absolute -bottom-16 right-6">
                        <View
                            className="w-32 h-32 rounded-full overflow-hidden"
                            style={{
                                borderWidth: 3,
                                borderColor: "#2E86DE",
                            }}
                        >
                            {hasProfileImage ? (
                                <>
                                    <ShimmerPlaceholder width={128} height={128} borderRadius={64} />
                                    <RNAnimated.View style={[StyleSheet.absoluteFillObject, { opacity: avatarOpacity }]}>
                                        <Image
                                            source={{ uri: tutor.profileImageUrl! }}
                                            resizeMode="cover"
                                            style={{ width: "100%", height: "100%" }}
                                            onLoad={() =>
                                                RNAnimated.timing(avatarOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start()
                                            }
                                        />
                                    </RNAnimated.View>
                                </>
                            ) : (
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }}>
                                    <GraduationCap size={56} color="#6B7280" />
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* ─── Content ─── */}
                <View className="px-5 pt-20 gap-5">

                    {/* Name + status badge + major */}
                    <View className="items-end gap-1.5">
                        <Text className="text-3xl font-bold text-[#1A1A2E] text-right">
                            {tutor.fullName}
                        </Text>
                        <View
                            className="rounded-full px-4 py-1.5"
                            style={{ borderWidth: 1, borderColor: "rgba(46,134,222,0.25)", backgroundColor: "rgba(46,134,222,0.10)" }}
                        >
                            <Text className="text-sm font-semibold text-[#2E86DE]">{statusText}</Text>
                        </View>
                        <View className="flex-row-reverse items-center gap-2">
                            <GraduationCap size={16} color="#9CA3AF" />
                            <Text className="text-base text-[#6B7280] text-right">{tutor.majorName}</Text>
                        </View>
                    </View>

                    {/* About */}
                    <View
                        className="overflow-hidden rounded-3xl bg-white"
                        style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.07)" }}
                    >
                        <View className="p-5">
                            <View className="flex-row-reverse items-center gap-2 mb-4">
                                <User size={18} color="#2E86DE" />
                                <Text className="text-lg font-bold text-[#1A1A2E]">אודות</Text>
                            </View>
                            <Text className="text-base leading-7 text-right text-[#6B7280]">
                                {tutor.bio && tutor.bio.trim().length > 0
                                    ? tutor.bio
                                    : "המתרגל עדיין לא הוסיף תיאור."}
                            </Text>
                        </View>
                    </View>

                    {/* Courses / Years / Major */}
                    <View
                        className="overflow-hidden rounded-3xl bg-white"
                        style={{ borderWidth: 1, borderColor: "rgba(46,134,222,0.15)" }}
                    >
                        <View className="p-5">
                            <View className="flex-row-reverse items-center gap-2 mb-4">
                                <BookOpen size={18} color="#2E86DE" />
                                <Text className="text-lg font-bold text-[#1A1A2E]">
                                    {tutor.courses.length > 0 ? "קורסים" : tutor.years.length > 0 ? "שנים" : "מסלול"}
                                </Text>
                            </View>
                            <View className="flex-row-reverse flex-wrap gap-2">
                                {labels.map((label, idx) => (
                                    <View
                                        key={`${label}-${idx}`}
                                        className="px-4 py-2 rounded-full"
                                        style={{ backgroundColor: "rgba(46,134,222,0.08)", borderWidth: 1, borderColor: "rgba(46,134,222,0.20)" }}
                                    >
                                        <Text className="text-sm font-semibold text-[#2E86DE]">{label}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Availability */}
                    <View
                        className="overflow-hidden rounded-3xl bg-white"
                        style={{ borderWidth: 1, borderColor: "rgba(166,108,255,0.15)" }}
                    >
                        <View className="p-5">
                            <View className="flex-row-reverse items-center gap-2 mb-4">
                                <Calendar size={18} color="#A66CFF" />
                                <Text className="text-lg font-bold text-[#1A1A2E]">זמינות</Text>
                            </View>
                            <View className="flex-row-reverse items-center gap-3">
                                <View
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: "#2E86DE" }}
                                />
                                <Text className="text-base text-[#6B7280] text-right">
                                    ימים א׳-ה׳, 17:00-21:00
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Animated.View>
    );
}
