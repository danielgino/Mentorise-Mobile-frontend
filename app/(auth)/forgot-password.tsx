import React, { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { router } from "expo-router";
import { Mail } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FormInput } from "@/components/ui/inputs/FormInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { LogoHeader } from "@/components/ui/LogoHeader";
import { ThemedText } from "@/components/ui/ThemedText";
import { forgotPassword } from "@/api/auth";
import { DesignTokens } from "@/constants/theme";

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const onSubmit = async () => {
        if (!email.trim() || loading) return;
        try {
            setLoading(true);
            await forgotPassword(email.trim());
        } catch {
            // Always show generic message — never reveal whether email exists
        } finally {
            setLoading(false);
            setSubmitted(true);
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
                        <ThemedText style={styles.titleText}>שכחת את הסיסמה?</ThemedText>
                        <Text style={styles.subtitleText}>
                            הזן את כתובת המייל שלך ונשלח לך קישור לאיפוס
                        </Text>
                    </View>

                    <LinearGradient
                        colors={["transparent", "rgba(46,134,222,0.18)", "rgba(166,108,255,0.18)", "transparent"]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.dividerAccent}
                    />

                    {submitted ? (
                        <View style={styles.successBox}>
                            <Text style={styles.successText}>
                                אם קיים חשבון עבור כתובת המייל הזו, נשלח אליה קישור לאיפוס הסיסמה.
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.fieldsContainer}>
                            <FormInput
                                label="אימייל"
                                value={email}
                                onChange={setEmail}
                                placeholder="name@email.com"
                                keyboardType="email-address"
                                rightIcon={<Mail />}
                            />

                            <PrimaryButton
                                onPress={onSubmit}
                                disabled={loading || !email.trim()}
                            >
                                {loading ? <ActivityIndicator color="#fff" /> : "שלח קישור לאיפוס"}
                            </PrimaryButton>
                        </View>
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
        marginBottom: 20,
    },
    successBox: {
        backgroundColor: "rgba(46,134,222,0.07)",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(46,134,222,0.20)",
        padding: 18,
        marginBottom: 20,
    },
    successText: {
        fontSize: 15,
        color: DesignTokens.textPrimary,
        textAlign: "right",
        lineHeight: 24,
        fontFamily: "Assistant_400Regular",
    },
    backLink: {
        alignItems: "center",
        marginTop: 8,
    },
    backLinkText: {
        fontSize: 15,
        color: DesignTokens.blue,
        fontFamily: "Assistant_500Medium",
        fontWeight: "500",
    },
});
