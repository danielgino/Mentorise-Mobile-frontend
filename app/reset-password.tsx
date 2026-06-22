import React, { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Lock } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FormInput } from "@/components/ui/inputs/FormInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { LogoHeader } from "@/components/ui/LogoHeader";
import { ThemedText } from "@/components/ui/ThemedText";
import { resetPassword } from "@/api/auth";
import { DesignTokens } from "@/constants/theme";

function mapError(message: string): string {
    if (message.toLowerCase().includes("expired")) {
        return "קישור האיפוס פג תוקף. בקש קישור חדש.";
    }
    if (message.toLowerCase().includes("already been used")) {
        return "קישור האיפוס כבר שומש. בקש קישור חדש.";
    }
    return "הקישור אינו תקין. בקש קישור חדש.";
}

export default function ResetPasswordScreen() {
    const { token } = useLocalSearchParams<{ token?: string }>();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const hasToken = Boolean(token);

    const onSubmit = async () => {
        if (!token || loading) return;

        if (newPassword.length < 8) {
            setError("הסיסמה חייבת להכיל לפחות 8 תווים.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("הסיסמאות אינן תואמות.");
            return;
        }

        setError("");
        try {
            setLoading(true);
            await resetPassword(token, newPassword);
            setSuccess(true);
            setTimeout(() => router.replace("/(auth)/login"), 1500);
        } catch (e: any) {
            const serverMessage: string = e?.response?.data?.message ?? e?.message ?? "";
            setError(mapError(serverMessage));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <LinearGradient
                colors={["rgba(46,134,222,0.10)", "rgba(166,108,255,0.06)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.blobTopRight}
            />
            <LinearGradient
                colors={["rgba(166,108,255,0.07)", "rgba(64,224,208,0.04)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.blobBottomLeft}
            />

            <View style={styles.content}>
                <LogoHeader />

                <View style={styles.formPanel}>
                    <View style={styles.headingBlock}>
                        <ThemedText style={styles.titleText}>איפוס סיסמה</ThemedText>
                        <Text style={styles.subtitleText}>
                            {hasToken ? "הזן סיסמה חדשה לחשבונך" : "הקישור אינו תקין"}
                        </Text>
                    </View>

                    <LinearGradient
                        colors={["transparent", "rgba(46,134,222,0.18)", "rgba(166,108,255,0.18)", "transparent"]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.dividerAccent}
                    />

                    {success ? (
                        <View style={styles.successBox}>
                            <Text style={styles.successText}>הסיסמה אופסה בהצלחה! מעביר אותך לדף ההתחברות...</Text>
                        </View>
                    ) : !hasToken ? (
                        <>
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>הקישור אינו תקין או חסר. בקש קישור חדש.</Text>
                            </View>
                            <Pressable
                                onPress={() => router.replace("/(auth)/forgot-password")}
                                style={styles.linkButton}
                            >
                                <Text style={styles.linkText}>בקש קישור חדש לאיפוס סיסמה</Text>
                            </Pressable>
                        </>
                    ) : (
                        <>
                            <View style={styles.fieldsContainer}>
                                <FormInput
                                    label="סיסמה חדשה"
                                    value={newPassword}
                                    onChange={setNewPassword}
                                    placeholder="לפחות 8 תווים"
                                    secureTextEntry
                                    showPasswordToggle
                                    rightIcon={<Lock />}
                                />
                                <FormInput
                                    label="אימות סיסמה"
                                    value={confirmPassword}
                                    onChange={setConfirmPassword}
                                    placeholder="הזן שוב את הסיסמה"
                                    secureTextEntry
                                    showPasswordToggle
                                    rightIcon={<Lock />}
                                />
                            </View>

                            {error ? (
                                <>
                                    <Text style={styles.errorText}>{error}</Text>
                                    <Pressable
                                        onPress={() => router.replace("/(auth)/forgot-password")}
                                        style={styles.linkButton}
                                    >
                                        <Text style={styles.linkText}>בקש קישור חדש לאיפוס סיסמה</Text>
                                    </Pressable>
                                </>
                            ) : null}

                            <PrimaryButton
                                onPress={onSubmit}
                                disabled={loading || !newPassword || !confirmPassword}
                            >
                                {loading ? <ActivityIndicator color="#fff" /> : "אפס סיסמה"}
                            </PrimaryButton>
                        </>
                    )}

                    <Pressable
                        onPress={() => router.replace("/(auth)/login")}
                        style={styles.backLink}
                    >
                        <Text style={styles.backLinkText}>חזור להתחברות</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: DesignTokens.surface,
        overflow: "hidden",
    },
    blobTopRight: {
        position: "absolute",
        top: -80,
        right: -80,
        width: 280,
        height: 280,
        borderRadius: 140,
    },
    blobBottomLeft: {
        position: "absolute",
        bottom: -60,
        left: -60,
        width: 220,
        height: 220,
        borderRadius: 110,
    },
    content: {
        flex: 1,
        paddingHorizontal: DesignTokens.paddingContainer,
        justifyContent: "center",
    },
    formPanel: {},
    headingBlock: {
        alignItems: "flex-end",
        marginBottom: 20,
    },
    titleText: {
        fontSize: 28,
        fontFamily: "Assistant_700Bold",
        fontWeight: "700",
        color: DesignTokens.textPrimary,
        textAlign: "right",
        letterSpacing: -0.5,
        marginBottom: 8,
        lineHeight: 36,
    },
    subtitleText: {
        fontSize: 15,
        color: DesignTokens.textSecondary,
        textAlign: "right",
    },
    dividerAccent: {
        height: 1,
        marginBottom: 24,
    },
    fieldsContainer: {
        gap: 16,
        marginBottom: 16,
    },
    successBox: {
        backgroundColor: "rgba(46,200,120,0.08)",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(46,200,120,0.25)",
        padding: 18,
        marginBottom: 20,
    },
    successText: {
        fontSize: 15,
        color: "#1A6B3C",
        textAlign: "right",
        lineHeight: 24,
        fontFamily: "Assistant_400Regular",
    },
    errorBox: {
        backgroundColor: "rgba(220,53,69,0.07)",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(220,53,69,0.18)",
        padding: 18,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 14,
        color: "#DC3545",
        textAlign: "right",
        marginBottom: 8,
        fontFamily: "Assistant_400Regular",
    },
    linkButton: {
        alignItems: "flex-end",
        marginBottom: 20,
    },
    linkText: {
        fontSize: 14,
        color: DesignTokens.blue,
        fontFamily: "Assistant_500Medium",
        fontWeight: "500",
    },
    backLink: {
        alignItems: "center",
        marginTop: 16,
    },
    backLinkText: {
        fontSize: 15,
        color: DesignTokens.blue,
        fontFamily: "Assistant_500Medium",
        fontWeight: "500",
    },
});
