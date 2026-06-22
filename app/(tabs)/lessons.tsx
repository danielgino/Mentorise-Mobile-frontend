import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ScrollView,
    Text,
    View,
    Pressable,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from "react-native";
import { GraduationCap } from "lucide-react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    runOnJS,
} from "react-native-reanimated";

import { LessonOfferCard } from "@/components/lessons/LessonOfferCard";
import { CompletedLessonCard } from "@/components/lessons/CompletedLessonCard";
import { UpcomingLessonCard } from "@/components/lessons/UpcomingLessonCard";

import { useAuth } from "@/hooks/AuthProvider";
import {
    createMockCheckout,
    confirmMockPayment,
    declineSessionOffer,
    getCompletedSessionOffers,
    getPendingSessionOffers,
    getUpcomingSessionOffers,
    type SessionOfferCardDto,
} from "@/api/sessionApi";
import {MockPaymentModal, PaymentFormState} from "@/components/MockPaymentModal";

type TabType = "offers" | "upcoming" | "completed";

const initialPaymentForm: PaymentFormState = {
    cardNumber: "",
    cardHolderName: "",
    expiry: "",
    cvv: "",
};

export default function LessonsScreen() {
    const { user } = useAuth();
    const currentUserId = user?.userId ?? null;

    const [activeTab, setActiveTab] = useState<TabType>("upcoming");
    // Separate state so content only swaps at the opacity=0 midpoint of the animation
    const [displayedTab, setDisplayedTab] = useState<TabType>("upcoming");

    // Reanimated shared values for the content crossfade
    const opacity = useSharedValue(1);
    const translateY = useSharedValue(0);

    const animatedContentStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    // Skip animation on initial mount
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // Phase 1 — fade + lift out (120 ms)
        opacity.value = withTiming(0, { duration: 120, easing: Easing.in(Easing.quad) });
        translateY.value = withTiming(
            -8,
            { duration: 120, easing: Easing.in(Easing.quad) },
            (finished) => {
                // Skip if this animation was cancelled by a faster tab press
                if (!finished) return;
                // Switch content while invisible
                runOnJS(setDisplayedTab)(activeTab);
                // Snap to entry position (below) then fade + rise in (180 ms)
                translateY.value = 12;
                opacity.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) });
                translateY.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.quad) });
            }
        );
    }, [activeTab]);

    // Pill indicator — visual left-to-right order inside the RTL flex container:
    //   completed = 0 (left)  upcoming = 1 (center)  offers = 2 (right)
    const TAB_PILL_INDEX: Record<TabType, number> = { completed: 0, upcoming: 1, offers: 2 };
    const [tabBarWidth, setTabBarWidth] = useState(0);
    const pillX = useSharedValue(0);

    const pillStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: pillX.value }],
    }));

    useEffect(() => {
        if (tabBarWidth === 0) return;
        const tabWidth = (tabBarWidth - 8) / 3; // 8 = 4px left + 4px right container padding
        pillX.value = withTiming(TAB_PILL_INDEX[activeTab] * tabWidth, {
            duration: 220,
            easing: Easing.out(Easing.cubic),
        });
    }, [activeTab, tabBarWidth]);

    const [lessonOffers, setLessonOffers] = useState<SessionOfferCardDto[]>([]);
    const [upcomingLessons, setUpcomingLessons] = useState<SessionOfferCardDto[]>([]);
    const [completedLessons, setCompletedLessons] = useState<SessionOfferCardDto[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<SessionOfferCardDto | null>(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentForm, setPaymentForm] =
        useState<PaymentFormState>(initialPaymentForm);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);

        return new Intl.DateTimeFormat("he-IL", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);

        return new Intl.DateTimeFormat("he-IL", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        }).format(date);
    };

    const mapOfferStatusToCardStatus = (
        status: SessionOfferCardDto["status"]
    ): "pending" | "declined" | "expired" => {
        switch (status) {
            case "DECLINED":
                return "declined";
            case "EXPIRED":
                return "expired";
            default:
                return "pending";
        }
    };

    const loadLessons = useCallback(async () => {
        try {
            const [pending, upcoming, completed] = await Promise.all([
                getPendingSessionOffers(),
                getUpcomingSessionOffers(),
                getCompletedSessionOffers(),
            ]);

            setLessonOffers(pending);
            setUpcomingLessons(upcoming);
            setCompletedLessons(completed);
        } catch (error) {
            if (__DEV__) console.warn("Failed to load lessons:", error);
            Alert.alert("שגיאה", "לא הצלחנו לטעון את השיעורים כרגע");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadLessons();
    }, [loadLessons]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadLessons();
    }, [loadLessons]);

    const openPaymentModal = (offer: SessionOfferCardDto) => {
        setSelectedOffer(offer);
        setPaymentForm(initialPaymentForm);
        setPaymentModalVisible(true);
    };

    const closePaymentModal = () => {
        if (paymentLoading) return;
        setPaymentModalVisible(false);
        setSelectedOffer(null);
        setPaymentForm(initialPaymentForm);
    };

    const updatePaymentForm = (
        field: keyof PaymentFormState,
        value: string
    ) => {
        if (field === "cardNumber") {
            const digitsOnly = value.replace(/\D/g, "").slice(0, 16);
            const formatted = digitsOnly.replace(/(.{4})/g, "$1 ").trim();
            setPaymentForm((prev) => ({ ...prev, cardNumber: formatted }));
            return;
        }

        if (field === "expiry") {
            const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
            const formatted =
                digitsOnly.length <= 2
                    ? digitsOnly
                    : `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
            setPaymentForm((prev) => ({ ...prev, expiry: formatted }));
            return;
        }

        if (field === "cvv") {
            const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
            setPaymentForm((prev) => ({ ...prev, cvv: digitsOnly }));
            return;
        }

        setPaymentForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleApprovePayment = async () => {
        if (!selectedOffer) return;

        const cleanCardNumber = paymentForm.cardNumber.replace(/\s/g, "").trim();
        const cardHolderName = paymentForm.cardHolderName.trim();
        const expiry = paymentForm.expiry.trim();
        const cvv = paymentForm.cvv.trim();

        if (!cleanCardNumber || cleanCardNumber.length < 13) {
            Alert.alert("שגיאה", "יש להזין מספר כרטיס תקין");
            return;
        }

        if (!cardHolderName) {
            Alert.alert("שגיאה", "יש להזין שם בעל הכרטיס");
            return;
        }

        if (!expiry || expiry.length !== 5 || !expiry.includes("/")) {
            Alert.alert("שגיאה", "יש להזין תוקף בפורמט MM/YY");
            return;
        }

        if (!cvv || cvv.length < 3) {
            Alert.alert("שגיאה", "יש להזין CVV תקין");
            return;
        }

        try {
            setPaymentLoading(true);
            setActionLoadingId(selectedOffer.id);

            const checkout = await createMockCheckout({
                sessionOfferId: selectedOffer.id,
            });

            const response = await confirmMockPayment({
                checkoutSessionId: checkout.checkoutSessionId,
                cardNumber: cleanCardNumber,
                cardHolderName,
                expiry,
                cvv,
            });

            await loadLessons();

            if (response.status === "FAILED") {
                Alert.alert("התשלום נכשל", response.message || "התשלום נכשל");
                return;
            }

            if (response.status !== "SUCCESS") {
                Alert.alert("שגיאה", response.message || "לא הצלחנו להשלים את התשלום");
                return;
            }

            closePaymentModal();
            Alert.alert("התשלום הושלם", response.message || "התשלום אושר בהצלחה");
        } catch (error: any) {
            const message =
                error?.response?.data?.message || "לא הצלחנו להשלים את התשלום כרגע";

            Alert.alert("שגיאה", message);
        } finally {
            setPaymentLoading(false);
            setActionLoadingId(null);
        }
    };
    const handleDecline = async (offerId: number) => {
        try {
            setActionLoadingId(offerId);
            await declineSessionOffer(offerId);
            await loadLessons();
        } catch (error) {
            if (__DEV__) console.warn("Failed to decline offer:", error);
            Alert.alert("שגיאה", "לא הצלחנו לדחות את ההצעה");
        } finally {
            setActionLoadingId(null);
        }
    };

    const renderEmptyState = (message: string) => (
        <View className="items-center rounded-3xl border border-[rgba(0,0,0,0.07)] bg-white px-6 py-14">
            <Text className="text-right text-base text-[#6B7280]">{message}</Text>
        </View>
    );

    return (
        <View className="flex-1">

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View className="px-5 pb-6 pt-10">
                    <View className="mb-3 ml-auto flex-row-reverse items-center">
                        <GraduationCap size={40} color="#2E86DE" />
                        <Text className="mr-3 text-4xl font-bold text-right text-[#1A1A2E]">
                            השיעורים שלי
                        </Text>
                    </View>
                    <Text className="text-right text-base text-[#6B7280]">
                        נהל את השיעורים והבקשות שלך
                    </Text>
                </View>

                <View className="mb-6 px-5">
                    <View
                        className="flex-row-reverse overflow-hidden rounded-full border border-[rgba(0,0,0,0.07)] bg-white p-1"
                        onLayout={(e) => {
                            const w = e.nativeEvent.layout.width;
                            if (w === tabBarWidth) return;
                            // Position pill instantly on first layout (no spring on mount)
                            pillX.value = TAB_PILL_INDEX[activeTab] * ((w - 8) / 3);
                            setTabBarWidth(w);
                        }}
                    >
                        {/* Sliding pill indicator — absolute, behind the tab text */}
                        {tabBarWidth > 0 && (
                            <Animated.View
                                className="absolute rounded-full border border-[#2E86DE]/25 bg-[#F0F4FF]"
                                style={[
                                    pillStyle,
                                    {
                                        width: (tabBarWidth - 8) / 3,
                                        top: 4,
                                        bottom: 4,
                                        left: 4,
                                    },
                                ]}
                            />
                        )}

                        <TabButton
                            title="הצעות שיעור"
                            active={activeTab === "offers"}
                            onPress={() => setActiveTab("offers")}
                        />

                        <TabButton
                            title="שיעורים קרובים"
                            active={activeTab === "upcoming"}
                            onPress={() => setActiveTab("upcoming")}
                        />

                        <TabButton
                            title="שיעורים שהסתיימו"
                            active={activeTab === "completed"}
                            onPress={() => setActiveTab("completed")}
                        />
                    </View>
                </View>

                <Animated.View className="px-5" style={animatedContentStyle}>
                    {loading ? (
                        <View className="items-center justify-center py-20">
                            <ActivityIndicator size="large" color="#2E86DE" />
                        </View>
                    ) : (
                        <>
                            {displayedTab === "offers" && (
                                <View className="gap-4">
                                    {lessonOffers.length === 0
                                        ? renderEmptyState("אין כרגע הצעות שיעור ממתינות")
                                        : lessonOffers.map((offer) => {
                                            const isStudentReceiver =
                                                currentUserId === offer.studentUserId;

                                            const isTutorSender =
                                                currentUserId === offer.tutorUserId;

                                            return (
                                                <View
                                                    key={offer.id}
                                                    className={
                                                        actionLoadingId === offer.id
                                                            ? "opacity-60"
                                                            : ""
                                                    }
                                                >
                                                    <LessonOfferCard
                                                        tutorName={offer.tutorFullName}
                                                        date={formatDate(offer.startTime)}
                                                        startTime={formatTime(offer.startTime)}
                                                        endTime={formatTime(offer.endTime)}
                                                        price={offer.price}
                                                        note={offer.note ?? undefined}
                                                        status={mapOfferStatusToCardStatus(
                                                            offer.status
                                                        )}
                                                        showActions={
                                                            offer.status === "PENDING" &&
                                                            isStudentReceiver
                                                        }
                                                        waitingForStudentApproval={
                                                            offer.status === "PENDING" &&
                                                            isTutorSender
                                                        }
                                                        onApprove={
                                                            isStudentReceiver
                                                                ? () => openPaymentModal(offer)
                                                                : undefined
                                                        }
                                                        onDecline={
                                                            isStudentReceiver
                                                                ? () => handleDecline(offer.id)
                                                                : undefined
                                                        }
                                                    />
                                                </View>
                                            );
                                        })}
                                </View>
                            )}

                            {displayedTab === "upcoming" && (
                                <View className="gap-4">
                                    {upcomingLessons.length === 0
                                        ? renderEmptyState("אין כרגע שיעורים קרובים")
                                        : upcomingLessons.map((lesson) => (
                                            <UpcomingLessonCard
                                                key={lesson.id}
                                                tutorName={lesson.tutorFullName}
                                                date={formatDate(lesson.startTime)}
                                                time={`${formatTime(
                                                    lesson.startTime
                                                )} - ${formatTime(lesson.endTime)}`}
                                                price={lesson.price}
                                                note={lesson.note ?? undefined}
                                            />
                                        ))}
                                </View>
                            )}

                            {displayedTab === "completed" && (
                                <View className="gap-4">
                                    {completedLessons.length === 0
                                        ? renderEmptyState("אין עדיין שיעורים שהסתיימו")
                                        : completedLessons.map((lesson) => (
                                            <CompletedLessonCard
                                                key={lesson.id}
                                                tutorName={lesson.tutorFullName}
                                                date={formatDate(lesson.startTime)}
                                                time={`${formatTime(
                                                    lesson.startTime
                                                )} - ${formatTime(lesson.endTime)}`}
                                                price={lesson.price}
                                                status="הושלם"
                                            />
                                        ))}
                                </View>
                            )}
                        </>
                    )}
                </Animated.View>
            </ScrollView>

            <MockPaymentModal
                visible={paymentModalVisible}
                offer={selectedOffer}
                loading={paymentLoading}
                form={paymentForm}
                onChange={updatePaymentForm}
                onClose={closePaymentModal}
                onSubmit={handleApprovePayment}
                formatDate={formatDate}
                formatTime={formatTime}
            />
        </View>
    );
}

type TabButtonProps = {
    title: string;
    active: boolean;
    onPress: () => void;
};

function TabButton({ title, active, onPress }: TabButtonProps) {
    return (
        <View className="flex-1">
            <Pressable onPress={onPress} className="overflow-hidden rounded-full">
                <View className="h-12 items-center justify-center px-2">
                    <Text
                        numberOfLines={1}
                        className={`text-center text-sm font-semibold ${
                            active ? "text-[#2E86DE]" : "text-[#9CA3AF]"
                        }`}
                    >
                        {title}
                    </Text>
                </View>
            </Pressable>
        </View>
    );
}