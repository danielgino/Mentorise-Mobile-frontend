import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ScrollView,
    Text,
    View,
    Pressable,
    ActivityIndicator,
    TextInput,
    Alert,
} from "react-native";
import {
    LogOut,
    BookOpen,
    ChevronLeft,
    GraduationCap,
    BookmarkPlus,
    FileUser,
    Image as ImageIcon,
    TrendingUp,
} from "lucide-react-native";

import {getMyTutorProfile, updateTutorProfile} from "@/api/tutorProfileApi";
import {updateMyProfileImage, deleteMyProfileImage, updateMyPhone} from "@/api/userProfileApi";
import { getMyPendingApplication } from "@/api/tutorApplicationsApi";
import { TutorApplicationStatusResponse } from "@/types/tutorApplications";
import { ProfileAvatar } from "@/components/ui/profile/ProfileAvatar";
import { GlassCard } from "@/components/ui/GlassCard";
import { FormInput } from "@/components/ui/inputs/FormInput";
import { transformProfile, validateProfileField } from "@/constants/profileValidators";
import { Chip } from "@/components/ui/Chip";
import { ThemedText } from "@/components/ui/ThemedText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useAuth } from "@/hooks/AuthProvider";
import { roleLabel } from "@/constants/utils";
import {
    getLearningPreferences,
    LearningPreferencesViewDto,
} from "@/api/learningPreferencesApi";
import { ROUTES } from "@/constants/routes";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { uploadImageToCloudinary } from "@/api/uploadToCloudinary";
import TutorImagePreview from "@/components/ui/profile/TutorImagePreview";

type FormState = {
    phone: string;
};

type ErrorsState = {
    phone: string;
};

const INITIAL_FORM: FormState = {
    phone: "",
};

const INITIAL_ERRORS: ErrorsState = {
    phone: "",
};

const MAX_TUTOR_BIO = 300;

function ReadOnlyField({
                           label,
                           value,
                       }: {
    label: string;
    value?: string | null;
}) {
    return (
        <View className="gap-2">
            <Text className="text-right text-base text-[#6B7280]">{label}</Text>
            <View className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4">
                <Text className="text-right text-lg text-[#1A1A2E]">
                    {value && value.trim().length > 0 ? value : "—"}
                </Text>
            </View>
        </View>
    );
}

/* ─── Row button בסגנון אחיד ─── */
function NavRow({
                    icon,
                    label,
                    onPress,
                    disabled,
                }: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    disabled?: boolean;
}) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 active:bg-[#F8F9FC]"
        >
            <View className="flex-row items-center justify-between">
                <ChevronLeft size={18} color="#9CA3AF" />
                <View className="flex-row-reverse items-center gap-3">
                    {icon}
                    <Text className="text-base text-[#1A1A2E]">{label}</Text>
                </View>
            </View>
        </Pressable>
    );
}

/* ─── כותרת סקשן אחידה ─── */
function SectionHeader({
                           icon,
                           title,
                       }: {
    icon: React.ReactNode;
    title: string;
}) {
    return (
        <View className="mb-5 flex-row-reverse items-center gap-3">
            {icon}
            <Text className="text-right text-xl font-semibold text-[#1A1A2E]">{title}</Text>
        </View>
    );
}

const ICON_GLOW_PURPLE = {
    zIndex: 1 as const,
    shadowColor: "#A66CFF",
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 15,
};

export default function ProfileScreen() {
    const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
    const [errors, setErrors] = useState<ErrorsState>(INITIAL_ERRORS);
    const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);

    const [prefs, setPrefs] = useState<LearningPreferencesViewDto | null>(null);
    const [prefsLoading, setPrefsLoading] = useState(false);
    const [prefsExpanded, setPrefsExpanded] = useState(false);

    const [tutorBio, setTutorBio] = useState("");
    const [tutorImage, setTutorImage] = useState<string>("");
    const [tutorImagePublicId, setTutorImagePublicId] = useState("");

    const [initialTutorBio, setInitialTutorBio] = useState("");
    const [initialTutorImage, setInitialTutorImage] = useState("");
    const [isUploadingTutorImage, setIsUploadingTutorImage] = useState(false);
    const [isSavingTutorProfile, setIsSavingTutorProfile] = useState(false);

    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
    const [isDeletingProfileImage, setIsDeletingProfileImage] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<TutorApplicationStatusResponse | null>(null);

    const { user, loading, signOut } = useAuth();
    const avatarUrl =
        profileImageUrl && profileImageUrl.trim().length > 0
            ? profileImageUrl.trim()
            : undefined;

    const hasProfileImage = !!avatarUrl;
    const isTutor = user?.role === "TUTOR";

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                setPrefsLoading(true);
                const data = await getLearningPreferences();
                if (mounted) setPrefs(data);
            } catch (e) {
                if (mounted) {
                    setPrefs({ scopeType: "MAJOR", yearLabels: [], courseNames: [] });
                }
            } finally {
                if (mounted) setPrefsLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        setFormData({ phone: user?.phoneNumber ?? "" });
        setErrors(INITIAL_ERRORS);
        setProfileImageUrl(user?.profileImageUrl ?? null);
    }, [user]);

    useEffect(() => {
        let mounted = true;
        getMyPendingApplication()
            .then(res => { if (mounted) setPendingStatus(res); })
            .catch(() => {});
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        let mounted = true;
        const loadTutorProfile = async () => {
            if (!user || user.role !== "TUTOR") return;
            try {
                const dto = await getMyTutorProfile();
                if (!mounted) return;
                const nextBio = dto.bio ?? "";
                const nextImage = dto.tutorImageUrl ?? "";
                const nextPublicId = dto.tutorImagePublicId ?? "";
                setTutorBio(nextBio);
                setTutorImage(nextImage);
                setTutorImagePublicId(nextPublicId);
                setInitialTutorBio(nextBio);
                setInitialTutorImage(nextImage);
            } catch (error) {
                if (__DEV__) console.warn("Failed to load tutor profile", error);
            }
        };
        loadTutorProfile();
        return () => { mounted = false; };
    }, [user]);

    const handleInputChange = useCallback((value: string) => {
        setFormData({ phone: value });
        setErrors((prev) => (prev.phone ? { phone: "" } : prev));
    }, []);

    const phoneChanged = useMemo(() => {
        return (formData.phone ?? "").trim() !== (user?.phoneNumber ?? "").trim();
    }, [formData.phone, user?.phoneNumber]);

    const tutorProfileChanged = useMemo(() => {
        return (
            tutorBio.trim() !== initialTutorBio.trim() ||
            tutorImage.trim() !== initialTutorImage.trim()
        );
    }, [tutorBio, initialTutorBio, tutorImage, initialTutorImage]);

    const handleUpdatePhone = useCallback(async () => {
        const msg = validateProfileField("phone", formData.phone);
        if (msg) { setErrors({ phone: msg }); return; }
        if (!phoneChanged) return;
        try {
            setIsUpdatingPhone(true);
            const updatedPhone = await updateMyPhone({ phoneNumber: formData.phone.trim() });
            setFormData({ phone: updatedPhone ?? formData.phone.trim() });
            Alert.alert("הצלחה", "מספר הטלפון עודכן בהצלחה");
        } catch (error: any) {
            Alert.alert("שגיאה", error?.response?.data?.message ?? "לא הצלחנו לעדכן את מספר הטלפון");
        } finally {
            setIsUpdatingPhone(false);
        }
    }, [formData.phone, phoneChanged]);

    const handleEditPhoto = useCallback(async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert("אין הרשאה", "צריך לאשר גישה לגלריה כדי להעלות תמונה");
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.9,
            });
            if (result.canceled || !result.assets?.length) return;
            setIsUploadingProfileImage(true);
            const uploaded = await uploadImageToCloudinary(result.assets[0].uri);
            const response = await updateMyProfileImage({
                profileImageUrl: uploaded.secureUrl,
                profileImagePublicId: uploaded.publicId,
            });
            const nextUrl = response?.profileImageUrl ?? uploaded.secureUrl ?? null;
            setProfileImageUrl(nextUrl && nextUrl.trim().length > 0 ? nextUrl.trim() : null);
            Alert.alert("הצלחה", "תמונת הפרופיל עודכנה בהצלחה");
        } catch (error: any) {
            Alert.alert("שגיאה", error?.response?.data?.message ?? "לא הצלחנו לעדכן את תמונת הפרופיל");
        } finally {
            setIsUploadingProfileImage(false);
        }
    }, []);

    const handleDeletePhoto = useCallback(() => {
        if (!hasProfileImage) return;
        Alert.alert("הסרת תמונת פרופיל", "האם להסיר את תמונת הפרופיל?", [
            { text: "ביטול", style: "cancel" },
            {
                text: "הסר",
                style: "destructive",
                onPress: async () => {
                    try {
                        setIsDeletingProfileImage(true);
                        await deleteMyProfileImage();
                        setProfileImageUrl(null);
                        Alert.alert("הצלחה", "תמונת הפרופיל הוסרה");
                    } catch (error: any) {
                        Alert.alert("שגיאה", error?.response?.data?.message ?? "לא הצלחנו להסיר את תמונת הפרופיל");
                    } finally {
                        setIsDeletingProfileImage(false);
                    }
                },
            },
        ]);
    }, [hasProfileImage]);

    const handleSaveTutorProfile = useCallback(async () => {
        try {
            setIsSavingTutorProfile(true);
            const payload = {
                bio: tutorBio.trim(),
                tutorImageUrl: tutorImage.trim() || null,
                tutorImagePublicId: tutorImagePublicId.trim() || null,
            };
            const updated = await updateTutorProfile(payload);
            const nextBio = updated.bio ?? payload.bio ?? "";
            const nextImage = updated.tutorImageUrl ?? payload.tutorImageUrl ?? "";
            const nextPublicId = updated.tutorImagePublicId ?? payload.tutorImagePublicId ?? "";
            setTutorBio(nextBio);
            setTutorImage(nextImage);
            setTutorImagePublicId(nextPublicId);
            setInitialTutorBio(nextBio);
            setInitialTutorImage(nextImage);
            Alert.alert("הצלחה", "פרופיל המתרגל עודכן בהצלחה");
        } catch (error: any) {
            Alert.alert("שגיאה", error?.response?.data?.message ?? "לא הצלחנו לעדכן את פרופיל המתרגל");
        } finally {
            setIsSavingTutorProfile(false);
        }
    }, [tutorBio, tutorImage, tutorImagePublicId]);

    const handleEditTutorImage = useCallback(async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert("אין הרשאה", "צריך לאשר גישה לגלריה כדי להעלות תמונה");
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [3, 2],
                quality: 0.9,
            });
            if (result.canceled || !result.assets?.length) return;
            setIsUploadingTutorImage(true);
            const uploaded = await uploadImageToCloudinary(result.assets[0].uri);
            setTutorImage(uploaded.secureUrl);
            setTutorImagePublicId(uploaded.publicId);
            await updateTutorProfile({ tutorImageUrl: uploaded.secureUrl, tutorImagePublicId: uploaded.publicId });
            setInitialTutorImage(uploaded.secureUrl);
            Alert.alert("הצלחה", "תמונת המתרגל עודכנה בהצלחה");
        } catch (error: any) {
            Alert.alert("שגיאה", error?.response?.data?.message ?? "לא הצלחנו לעדכן את תמונת המתרגל");
        } finally {
            setIsUploadingTutorImage(false);
        }
    }, []);

    const handleLogout = useCallback(async () => {
        if (isLoggingOut) return;
        try {
            setIsLoggingOut(true);
            await signOut();
            router.replace("/(auth)/login");
        } catch (error: any) {
            setIsLoggingOut(false);
            Alert.alert("שגיאה", error?.message ?? "לא הצלחנו להתנתק");
        }
    }, [signOut, isLoggingOut]);

    if (loading) return <ActivityIndicator />;
    if (!user) return <Text>תם תוקף הסשן התחבר מחדש</Text>;

    return (
        <View className="flex-1">
            <ScrollView
                contentContainerStyle={{ paddingBottom: 56 }}
                className="px-5 py-8"
                showsVerticalScrollIndicator={false}
            >
                {/* ─── Header / Avatar ─── */}
                <View className="items-center pt-6 pb-2">
                    <ProfileAvatar
                        imageUrl={avatarUrl}
                        name={user.fullName}
                        onEditClick={handleEditPhoto}
                        uploading={isUploadingProfileImage}
                    />

                    <View className="mt-3 items-center">
                        <Text className="text-3xl font-bold text-[#1A1A2E]">{user.fullName}</Text>
                    </View>

                    <Pressable
                        onPress={handleEditPhoto}
                        disabled={isUploadingProfileImage}
                        className="mt-2 active:opacity-70"
                    >
                        <Text className="text-base text-[#2E86DE]">
                            {isUploadingProfileImage ? "מעלה תמונה..." : "שנה תמונה"}
                        </Text>
                    </Pressable>

                    {hasProfileImage && (
                        <Pressable
                            onPress={handleDeletePhoto}
                            disabled={isUploadingProfileImage || isDeletingProfileImage}
                            className="mt-2 active:opacity-70"
                        >
                            <Text className="text-sm text-red-400">
                                {isDeletingProfileImage ? "מסיר תמונה..." : "הסר תמונת פרופיל"}
                            </Text>
                        </Pressable>
                    )}
                </View>

                {/* Badge תפקיד */}
                <View className="mt-4 flex-row justify-center">
                    <Chip variant="course" selected={true} label={roleLabel(user.role)} />
                </View>

                {/* ─── הפרטים שלי ─── */}
                <View className="mt-8">
                    <GlassCard className="p-6">
                        <SectionHeader
                            icon={<FileUser size={22} color="#2E86DE" />}
                            title="הפרטים שלי"
                        />

                        <View className="gap-6">
                            <ReadOnlyField label="שם מלא" value={user.fullName} />
                            <ReadOnlyField label="אימייל" value={user.email} />

                            <View className="gap-2">
                                <Text className="text-right text-base text-[#6B7280]">טלפון</Text>
                                <View
                                    className="rounded-2xl bg-white px-5 py-4"
                                    style={{
                                        borderWidth: 1,
                                        borderColor: errors.phone ? "#E24B4A" : "#E5E7EB",
                                    }}
                                >
                                    <TextInput
                                        value={formData.phone}
                                        onChangeText={(text) =>
                                            handleInputChange(transformProfile.phone(text))
                                        }
                                        onBlur={() => {
                                            const msg = validateProfileField("phone", formData.phone);
                                            setErrors({ phone: msg ?? "" });
                                        }}
                                        placeholder="הזן מספר טלפון"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="phone-pad"
                                        textAlign="right"
                                        className="text-right text-lg text-[#1A1A2E]"
                                    />
                                </View>
                                {errors.phone ? (
                                    <Text className="text-right text-xs text-[#E24B4A]">
                                        {errors.phone}
                                    </Text>
                                ) : null}
                            </View>

                            <Text className="text-right text-sm text-[#9CA3AF]">
                                כרגע ניתן לעדכן רק את מספר הטלפון.
                            </Text>

                            {phoneChanged && (
                                <View className="mt-1">
                                    <PrimaryButton
                                        variant="gradient"
                                        onPress={handleUpdatePhone}
                                        disabled={isUpdatingPhone}
                                    >
                                        עדכן מספר טלפון
                                    </PrimaryButton>
                                </View>
                            )}
                        </View>
                    </GlassCard>
                </View>

                {/* ─── העדפות לימוד ─── */}
                <View className="mt-6">
                    <GlassCard className="p-6">
                        <SectionHeader
                            icon={<BookOpen size={22} color="#2E86DE" />}
                            title="העדפות לימוד"
                        />

                        <View className="flex-row-reverse flex-wrap gap-2">
                            {prefsLoading ? (
                                <ActivityIndicator />
                            ) : !prefs ? (
                                <Chip variant="course" label="לא נטענו העדפות" />
                            ) : prefs.scopeType === "COURSE" ? (
                                (() => {
                                    const max = 6;
                                    const list = prefs.courseNames ?? [];
                                    if (list.length === 0) return <Chip variant="course" label="לא נבחרו קורסים" />;
                                    const shown = prefsExpanded ? list : list.slice(0, max);
                                    const hiddenCount = list.length - max;
                                    return (
                                        <>
                                            {shown.map((name) => <Chip variant="course" key={name} label={name} />)}
                                            {!prefsExpanded && hiddenCount > 0 && (
                                                <Chip
                                                    variant="course"
                                                    selected
                                                    label={`+ עוד ${hiddenCount}`}
                                                    onPress={() => setPrefsExpanded(true)}
                                                />
                                            )}
                                        </>
                                    );
                                })()
                            ) : prefs.scopeType === "YEAR" ? (
                                (() => {
                                    const list = prefs.yearLabels ?? [];
                                    if (list.length === 0) return <Chip variant="course" label="לא נבחרו שנים" />;
                                    return <>{list.map((lbl) => <Chip variant="course" key={lbl} label={lbl} />)}</>;
                                })()
                            ) : (
                                <Chip variant="course" label={`תרגול כללי במסלול ${user.majorName}`} />
                            )}
                        </View>

                        {prefs?.scopeType === "COURSE" && prefsExpanded && (prefs.courseNames?.length ?? 0) > 6 && (
                            <Pressable
                                onPress={() => setPrefsExpanded(false)}
                                className="mt-3 items-end active:opacity-70"
                            >
                                <Text className="text-sm text-[#2E86DE]">הצג פחות</Text>
                            </Pressable>
                        )}

                        <View className="mt-5">
                            <NavRow
                                icon={<BookOpen size={20} color="#A66CFF" style={ICON_GLOW_PURPLE} />}
                                label="שינוי העדפות התרגול שלי"
                                onPress={() => router.push({ pathname: ROUTES.ONBOARDING.LEARNING_TYPE, params: { mode: "edit" } })}
                            />
                        </View>
                    </GlassCard>
                </View>

                {/* ─── מידע נוסף ─── */}
                <View className="mt-6">
                    <GlassCard className="p-6">
                        <SectionHeader
                            icon={<BookmarkPlus size={22} color="#2E86DE" />}
                            title="מידע נוסף"
                        />

                        {pendingStatus?.hasPending ? (
                            <View className="w-full flex-row-reverse items-center gap-3 rounded-2xl border border-[#FCD34D] bg-[#FFFBEB] px-5 py-4">
                                <GraduationCap size={20} color="#D97706" />
                                <Text className="flex-1 text-right text-base text-[#92400E]">
                                    יש לך כבר בקשת מתרגל שממתינה לבדיקה
                                </Text>
                            </View>
                        ) : isTutor ? (
                            <NavRow
                                icon={<GraduationCap size={20} color="#A66CFF" style={ICON_GLOW_PURPLE} />}
                                label="עדכון תחומי תרגול"
                                onPress={() => router.push({ pathname: ROUTES.TUTOR_REQUEST.PAGE, params: { mode: "update" } })}
                            />
                        ) : (
                            <NavRow
                                icon={<GraduationCap size={20} color="#A66CFF" style={ICON_GLOW_PURPLE} />}
                                label="רוצה להצטרף לצוות המתרגלים?"
                                onPress={() => router.push({ pathname: ROUTES.TUTOR_REQUEST.PAGE, params: { mode: "initial" } })}
                            />
                        )}
                    </GlassCard>
                </View>

                {/* ─── פרופיל מתרגל (TUTOR בלבד) ─── */}
                {isTutor && (
                    <View className="mt-6">
                        <GlassCard className="p-6">
                            <SectionHeader
                                icon={<GraduationCap size={22} color="#2E86DE" />}
                                title="פרופיל מתרגל"
                            />

                            <View className="gap-6">
                                {/* תמונת מתרגל */}
                                <View className="gap-3">
                                    <TutorImagePreview
                                        imageUrl={tutorImage || undefined}
                                        name={user.fullName}
                                        uploading={isUploadingTutorImage}
                                    />
                                    <Text className="text-center text-sm text-[#9CA3AF]">
                                        תמונת מתרגל נפרדת מתמונת הפרופיל
                                    </Text>
                                </View>

                                <NavRow
                                    icon={<ImageIcon size={20} color="#A66CFF" style={ICON_GLOW_PURPLE} />}
                                    label={isUploadingTutorImage ? "מעלה תמונת מתרגל..." : "עדכון תמונת מתרגל"}
                                    onPress={handleEditTutorImage}
                                    disabled={isUploadingTutorImage}
                                />

                                {/* תיאור מתרגל */}
                                <View className="gap-3">
                                    <Text className="text-right text-base text-[#6B7280]">
                                        תיאור מתרגל
                                    </Text>

                                    <View className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4">
                                        <TextInput
                                            value={tutorBio}
                                            onChangeText={setTutorBio}
                                            maxLength={MAX_TUTOR_BIO}
                                            multiline
                                            scrollEnabled
                                            textAlign="right"
                                            placeholder="כתוב כמה מילים עליך כמתרגל, סגנון הלימוד שלך, תחומים חזקים ועוד..."
                                            placeholderTextColor="#9CA3AF"
                                            className="text-lg text-[#1A1A2E]"
                                            style={{ textAlignVertical: "top", height: 160 }}
                                        />
                                    </View>

                                    <Text className="text-left text-sm text-[#9CA3AF]">
                                        {tutorBio.length}/{MAX_TUTOR_BIO}
                                    </Text>

                                    {tutorProfileChanged && (
                                        <View className="mt-1">
                                            <PrimaryButton
                                                variant="gradient"
                                                onPress={handleSaveTutorProfile}
                                                disabled={isSavingTutorProfile}
                                            >
                                                {isSavingTutorProfile ? "שומר..." : "שמור תיאור מתרגל"}
                                            </PrimaryButton>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </GlassCard>
                    </View>
                )}

                {/* ─── הכנסות ותשלומים (TUTOR בלבד) ─── */}
                {isTutor && (
                    <View className="mt-6">
                        <GlassCard className="p-6">
                            <SectionHeader
                                icon={<TrendingUp size={22} color="#2E86DE" />}
                                title="הכנסות ותשלומים"
                            />
                            <NavRow
                                icon={<TrendingUp size={20} color="#A66CFF" style={ICON_GLOW_PURPLE} />}
                                label="הכנסות ומחזורי תשלום"
                                onPress={() => router.push(ROUTES.EARNINGS)}
                            />
                        </GlassCard>
                    </View>
                )}

                {/* ─── התנתקות ─── */}
                <View className="mt-10">
                    <Pressable
                        onPress={handleLogout}
                        disabled={isLoggingOut}
                        className={`flex-row items-center justify-center gap-2 py-3 ${
                            isLoggingOut ? "opacity-50" : "active:opacity-70"
                        }`}
                    >
                        <LogOut size={18} color="#F87171" />
                        {/* ← כפתור יציאה קריא יותר */}
                        <Text className="text-base text-red-400">
                            {isLoggingOut ? "מתנתק..." : "התנתקות"}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}