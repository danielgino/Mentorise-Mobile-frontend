import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { TutorApplicationScopeCreate, TutorApplicationStatusResponse } from "@/types/tutorApplications";
import { ArrowRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Card from "@/components/tutor-apply/Card";
import RTLTabs, { TabId } from "@/components/tutor-apply/RTLTabs";
import RTLSwitch from "@/components/tutor-apply/RTLSwitch";
import { Chip } from "@/components/ui/Chip";
import { FormInput } from "@/components/ui/inputs/FormInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ModalSelector } from "@/components/ui/ModalSelector";
import FileUploadButton, { PickedFile } from "@/components/tutor-apply/FileUploadButton";
import SuccessScreen from "@/components/tutor-apply/SuccessScreen";
import CourseListItem from "@/components/tutor-apply/CourseListItem";
import TutorApplicationStatusCard from "@/components/tutor-apply/TutorApplicationStatusCard";
import { uploadPdfToCloudinary } from "@/api/uploadToCloudinary";
import { createTutorApplicationJSON, getMyApprovedScopes, getMyPendingApplication } from "@/api/tutorApplicationsApi";
import { useMyCourses } from "@/hooks/useMyCourses";
import { yearLabel } from "@/types/course";
import { useToggleArray } from "@/hooks/useToggleArray";
import { ROUTES } from "@/constants/routes";


export default function TutorApplyScreen() {
    const insets = useSafeAreaInsets();
    const { mode } = useLocalSearchParams<{ mode?: string }>();
    const isUpdate = mode === "update";

    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Safety-net guard: tutor.tsx already blocks entry, this catches direct navigation
    const [pendingStatus, setPendingStatus] = useState<TutorApplicationStatusResponse | null>(null);
    const [lastRejected, setLastRejected] = useState(false);

    const { courses, availableYears, loading: coursesLoading, error: coursesError } = useMyCourses();

    const yearOptions = useMemo(
        () => availableYears.map(y => ({ value: String(y), label: yearLabel(y) })),
        [availableYears]
    );

    // scope
    const [scopeTab, setScopeTab] = useState<TabId>("courses");
    const coursesToggle = useToggleArray<number>([]);
    const yearsToggle = useToggleArray<number>([]);
    const [applyAllMajor, setApplyAllMajor] = useState(false);
    const [courseSearch, setCourseSearch] = useState("");

    // notes / docs
    const [notes, setNotes] = useState("");
    const [transcriptUrl, setTranscriptUrl] = useState("");
    const [transcriptFile, setTranscriptFile] = useState<PickedFile | null>(null);

    const [errors, setErrors] = useState<Record<string, string>>({});

    // ─── Pending guard (safety net — tutor.tsx already blocks, this catches direct nav) ───
    useEffect(() => {
        getMyPendingApplication()
            .then(res => {
                if (res.hasPending) {
                    setPendingStatus(res);
                } else if (res.lastRejected) {
                    setLastRejected(true);
                }
            })
            .catch(() => {});
    }, []);

    // ─── Pre-fill current approved scopes for UPDATE mode ───
    const prefillDone = useRef(false);
    useEffect(() => {
        if (!isUpdate || prefillDone.current || coursesLoading) return;
        prefillDone.current = true;
        getMyApprovedScopes()
            .then(scopes => {
                if (!scopes || scopes.length === 0) return;

                const hasMajor = scopes.some(s => s.scopeType === "MAJOR");
                if (hasMajor) {
                    setApplyAllMajor(true);
                    return;
                }

                const courseIds = scopes
                    .filter(s => s.scopeType === "COURSE" && s.courseId != null)
                    .map(s => s.courseId!);
                const yearNumbers = scopes
                    .filter(s => s.scopeType === "YEAR" && s.yearNumber != null && availableYears.includes(s.yearNumber))
                    .map(s => s.yearNumber!);

                if (courseIds.length > 0) coursesToggle.setSelected(courseIds);
                if (yearNumbers.length > 0) yearsToggle.setSelected(yearNumbers);
                if (yearNumbers.length > 0 && courseIds.length === 0) setScopeTab("years");
            })
            .catch(() => {});
    }, [isUpdate, coursesLoading, availableYears]);

    function buildScopes(
        selectedCourses: number[],
        selectedYears: number[],
        allMajor: boolean
    ): TutorApplicationScopeCreate[] {
        if (allMajor) return [{ scopeType: "MAJOR" }];
        const courseScopes = selectedCourses.map(id => ({ scopeType: "COURSE" as const, courseId: id }));
        const yearScopes = selectedYears.map(y => ({ scopeType: "YEAR" as const, yearNumber: y }));
        return [...courseScopes, ...yearScopes];
    }

    const filteredCourses = useMemo(() => {
        if (!courseSearch.trim()) return courses;
        const s = courseSearch.trim().toLowerCase();
        return courses.filter(
            c => c.name.includes(courseSearch) || c.code.includes(s) || c.name.toLowerCase().includes(s)
        );
    }, [courseSearch, courses]);

    const visibleCourses = useMemo(() => filteredCourses.slice(0, 5), [filteredCourses]);

    const clearScopeSelection = () => {
        coursesToggle.clear();
        yearsToggle.clear();
        setApplyAllMajor(false);
    };

    const hasScopeSelection = applyAllMajor || coursesToggle.count > 0 || yearsToggle.count > 0;

    const getScopeSummary = () => {
        if (applyAllMajor) return "נבחר – כל המסלול";
        const parts: string[] = [];
        if (coursesToggle.count > 0) {
            const names = coursesToggle.selected
                .map(id => courses.find(c => c.id === id)?.name)
                .filter(Boolean)
                .join(", ");
            parts.push(`נבחרו ${coursesToggle.count} קורסים: ${names}`);
        }
        if (yearsToggle.count > 0) {
            parts.push(`נבחרה שנה: ${yearsToggle.selected.map(y => yearLabel(y)).join(", ")}`);
        }
        return parts.join(" • ");
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!transcriptUrl.trim() && !transcriptFile) newErrors.transcriptUrl = "שדה חובה";
        if (!applyAllMajor && coursesToggle.count === 0 && yearsToggle.count === 0) {
            newErrors.scope = "בחר/י לפחות אפשרות אחת: קורסים, שנה מלאה או כל המסלול.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitApplication = async () => {
        try {
            setIsSubmitting(true);
            const uploadedUrl = await uploadPdfToCloudinary(transcriptFile!.uri);
            const scopes = buildScopes(coursesToggle.selected, yearsToggle.selected, applyAllMajor);
            const payload = {
                requestText: notes?.trim() || undefined,
                transcriptUrl: uploadedUrl,
                scopes,
            };
            await createTutorApplicationJSON(payload);
            setIsSubmitting(false);
            setSubmitted(true);
        } catch (e: any) {
            setIsSubmitting(false);
            const serverMsg = e?.response?.data?.message;
            Alert.alert("שגיאה בשליחה", serverMsg ?? e?.message ?? "אירעה שגיאה, נסה/י שוב.");
        }
    };

    const handleSubmitPress = () => {
        if (!transcriptFile) {
            Alert.alert("שגיאה", "יש להעלות קובץ גיליון ציונים (PDF)");
            return;
        }
        if (!validate()) return;

        Alert.alert(
            "אישור שליחת הבקשה",
            "אנא ודא שכל פרטי הבקשה נכונים. לאחר השליחה לא ניתן יהיה לערוך את הבקשה או להגיש בקשה נוספת עד לסיום הטיפול בה.",
            [
                { text: "ביטול", style: "cancel" },
                { text: "שלח לבדיקה", onPress: submitApplication },
            ]
        );
    };

    // ─── Safety-net pending card (normally blocked by tutor.tsx) ───
    if (pendingStatus) {
        return <TutorApplicationStatusCard status={pendingStatus} onBack={() => router.back()} />;
    }

    // ─── Success screen ───
    if (submitted) {
        return (
            <SuccessScreen
                mode={mode}
                onBackToHome={() => router.replace("/")}
                onViewApplications={() => router.replace({
                    pathname: ROUTES.TUTOR_REQUEST.PAGE,
                    params: { mode: mode ?? "initial" },
                })}
            />
        );
    }

    return (
        <View className="flex-1 bg-[#F9FAFB]">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
            >
                {/* ─── Inline header ─── */}
                <View style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                    paddingTop: insets.top + 8,
                    marginBottom: 20,
                }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 24, fontFamily: "Assistant_600SemiBold", fontWeight: "600", color: "#1A1A2E", textAlign: "right" }}>
                            {isUpdate ? "עדכון תחומי תרגול" : "בקשת מתרגל"}
                        </Text>
                        <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "right", marginTop: 3 }}>
                            {isUpdate
                                ? "הבחירות הנוכחיות שלך מוצגות מטה. ניתן להוסיף, להסיר או לשנות."
                                : "מלא את הפרטים ונחזור אליך בהקדם"}
                        </Text>
                    </View>
                    <Pressable
                        onPress={() => router.back()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#F0F4FF", alignItems: "center", justifyContent: "center" }}>
                            <ArrowRight size={20} color="#1A1A2E" />
                        </View>
                    </Pressable>
                </View>

                {/* ─── Rejected banner ─── */}
                {lastRejected && (
                    <View
                        className="mb-3 rounded-2xl p-4"
                        style={{ backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA" }}
                    >
                        <Text className="text-right text-base text-[#B91C1C]">
                            הבקשה הקודמת נדחתה. ניתן להגיש בקשה חדשה.
                        </Text>
                    </View>
                )}

                {/* Scope Selection */}
                <Card>
                    <Text className="text-right text-[#1A1A1A] text-xl font-bold mb-2">
                        {isUpdate ? "תחומי תרגול" : "היקף הבקשה"}
                    </Text>
                    <Text className="text-right text-base text-[#6B7280] mb-4">
                        {isUpdate
                            ? "הבחירות הנוכחיות שלך מוצגות מטה. ניתן להוסיף, להסיר או לשנות."
                            : "בחר/י את תחומי ההתרגלות הרצויים. ניתן לשלב בין אפשרויות קורסים בודדים לשנים."}
                    </Text>

                    <RTLTabs
                        tabs={[
                            { id: "years", label: "שנה מלאה" },
                            { id: "courses", label: "קורסים בודדים" },
                            { id: "all", label: "כל המסלול" },
                        ]}
                        activeTab={scopeTab}
                        onChange={t => setScopeTab(t)}
                    />

                    <View className="mt-6">
                        {scopeTab === "courses" && (
                            <View className="space-y-4">
                                {!coursesLoading && !coursesError && (
                                    <FormInput variant="search" value={courseSearch} onChange={setCourseSearch} placeholder="חיפוש קורס…" />
                                )}
                                {coursesToggle.count > 0 && (
                                    <View className="flex-row-reverse flex-wrap gap-2 mt-3 mb-3">
                                        {coursesToggle.selected.map(courseId => {
                                            const course = courses.find(c => c.id === courseId);
                                            if (!course) return null;
                                            return (
                                                <Chip
                                                    variant="removable"
                                                    key={courseId}
                                                    label={course.name}
                                                    onRemove={() => coursesToggle.remove(courseId)}
                                                />
                                            );
                                        })}
                                    </View>
                                )}

                                <View className={`border border-[#E5E7EB] rounded-2xl overflow-hidden ${applyAllMajor ? "opacity-50" : ""}`}>
                                    {coursesLoading ? (
                                        <View className="py-6 items-center justify-center">
                                            <Text className="text-base text-[#6B7280]">טוען קורסים…</Text>
                                        </View>
                                    ) : coursesError ? (
                                        <View className="py-4 px-4">
                                            <Text className="text-base text-[#EF4444] text-right">
                                                לא ניתן לטעון את הקורסים כרגע, נסה לטעון את הטופס שוב
                                            </Text>
                                        </View>
                                    ) : (
                                        visibleCourses.map(course => (
                                            <CourseListItem
                                                key={course.id}
                                                course={course}
                                                selected={coursesToggle.isSelected(course.id)}
                                                onToggle={() => !applyAllMajor && coursesToggle.toggle(course.id)}
                                            />
                                        ))
                                    )}
                                </View>
                            </View>
                        )}

                        {scopeTab === "years" && (
                            availableYears.length === 0 ? (
                                <Text className="text-center text-base text-[#6B7280] py-4">
                                    לא נמצאו שנים זמינות
                                </Text>
                            ) : (
                                <ModalSelector
                                    variant="inline"
                                    options={yearOptions}
                                    selectedValues={yearsToggle.selected.map(String)}
                                    onToggle={v => yearsToggle.toggle(Number(v))}
                                    disabled={applyAllMajor}
                                />
                            )
                        )}

                        {scopeTab === "all" && (
                            <View>
                                <RTLSwitch
                                    label="בקשה לכל קורסי המסלול"
                                    checked={applyAllMajor}
                                    onChange={setApplyAllMajor}
                                />
                                {applyAllMajor && (
                                    <Text className="mt-3 text-base text-[#6B7280] text-right">
                                        כאשר נבחר 'כל המסלול', אין צורך לבחור קורסים/שנים.
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>

                    {hasScopeSelection && (
                        <View className="mt-6 p-4 bg-gray-50 rounded-2xl">
                            <View className="flex-row items-start justify-between mb-2">
                                <Text className="text-base font-semibold text-[#1A1A1A]">סיכום בחירה</Text>
                                <Text className="text-base text-[#2E86DE]" onPress={clearScopeSelection}>
                                    נקה בחירה
                                </Text>
                            </View>
                            <Text className="text-base text-[#6B7280] text-right">{getScopeSummary()}</Text>
                        </View>
                    )}

                    {!!errors.scope && (
                        <Text className="mt-2 text-base text-[#EF4444] text-right">{errors.scope}</Text>
                    )}
                </Card>

                {/* Notes */}
                <Card>
                    <FormInput
                        variant="light"
                        multiline
                        label="הערות"
                        placeholder="פרטים נוספים (לא חובה)"
                        value={notes}
                        onChange={setNotes}
                    />
                </Card>

                {/* Documents */}
                <Card>
                    <Text className="mb-6 text-right text-[#1A1A1A] text-xl font-bold">
                        {isUpdate ? "מסמכים נלווים – גיליון ציונים מעודכן" : "מסמכים נלווים-טופס ציונים"}
                    </Text>

                    <View className="space-y-4">
                        <View className="flex-row items-center">
                            <View className="flex-1 border-t border-[#E5E7EB]" />
                            <Text className="px-3 text-base text-[#6B7280]">או</Text>
                            <View className="flex-1 border-t border-[#E5E7EB]" />
                        </View>

                        <FileUploadButton
                            label="העלאת קובץ גיליון ציונים"
                            value={transcriptFile}
                            onChange={setTranscriptFile}
                            helper="נדרש ציון ≥ 85 בקורס/ים הרלוונטיים."
                        />
                    </View>
                </Card>
            </ScrollView>

            {/* Sticky Bottom Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB]">
                <View className="px-4 py-4">
                    <PrimaryButton fullWidth onPress={handleSubmitPress} loading={isSubmitting} disabled={isSubmitting}>
                        {isUpdate ? "שלח עדכון" : "שליחה לבדיקה"}
                    </PrimaryButton>
                </View>
            </View>
        </View>
    );
}
