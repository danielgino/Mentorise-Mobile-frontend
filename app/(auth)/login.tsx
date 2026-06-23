import React, { useState, useEffect, useRef } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { FormInput } from "@/components/ui/inputs/FormInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { login } from "@/api/auth";
import { Link, router } from "expo-router";
import { useAuth } from "@/hooks/AuthProvider";
import { Mail, Lock } from "lucide-react-native";
import { LogoHeader } from "@/components/ui/LogoHeader";
import { LinearGradient } from "expo-linear-gradient";
import { DesignTokens } from "@/constants/theme";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { signIn } = useAuth();

    const logoScale      = useRef(new Animated.Value(0.8)).current;
    const logoOpacity    = useRef(new Animated.Value(0)).current;
    const formOpacity    = useRef(new Animated.Value(0)).current;
    const formTranslateY = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(logoScale, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
                easing: Easing.out(Easing.back(1.2)),
            }),
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(formOpacity, {
                toValue: 1,
                duration: 480,
                delay: 300,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(formTranslateY, {
                toValue: 0,
                duration: 400,
                delay: 300,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }),
        ]).start();
    }, []);

    const onSubmit = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError("יש להזין כתובת אימייל");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setError("יש להזין כתובת אימייל תקינה");
            return;
        }
        if (!password) {
            setError("יש להזין סיסמה");
            return;
        }

        setError(null);
        try {
            setLoading(true);
            const res = await login(trimmedEmail, password);
            await signIn(res.token);
            router.replace("/(tabs)");
        } catch {
            setError("אחד מפרטי ההתחברות שהזנת אינו נכון");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            {/* Decorative ambient blobs */}
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

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                {/* Logo */}
                <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoOpacity }}>
                    <LogoHeader />
                </Animated.View>

                {/* Form panel — staggered entrance */}
                <Animated.View
                    style={[
                        styles.formPanel,
                        { opacity: formOpacity, transform: [{ translateY: formTranslateY }] },
                    ]}
                >
                    {/* Heading block */}
                    <View style={styles.headingBlock}>
                        <ThemedText style={styles.titleText}>התחברות</ThemedText>

                        {/* RTL subtitle row: JSX order [link] [text] → visual LTR [הירשם | איך לך...] → reads RTL "איך לך עדיין משתמש? הירשם" */}
                        <View style={styles.subtitleRow}>
                            <Link href="/(onboarding)/register" asChild>
                                <Pressable>
                                    <Text style={styles.registerLink}>הירשם</Text>
                                </Pressable>
                            </Link>
                            <Text style={styles.subtitleText}>איך לך עדיין משתמש? </Text>
                        </View>
                    </View>

                    {/* Gradient divider accent */}
                    <LinearGradient
                        colors={["transparent", "rgba(46,134,222,0.18)", "rgba(166,108,255,0.18)", "transparent"]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.dividerAccent}
                    />

                    {/* Inputs */}
                    <View style={styles.fieldsContainer}>
                        <FormInput
                            label="אימייל"
                            value={email}
                            onChange={setEmail}
                            placeholder="name@email.com"
                            keyboardType="email-address"
                            rightIcon={<Mail />}
                        />
                        <FormInput
                            label="סיסמה"
                            value={password}
                            onChange={setPassword}
                            placeholder="••••••••"
                            secureTextEntry
                            showPasswordToggle
                            rightIcon={<Lock />}
                        />
                        <Pressable
                            onPress={() => router.push("/(auth)/forgot-password")}
                            style={{ alignItems: "flex-end", marginTop: -8 }}
                        >
                            <Text style={styles.forgotPasswordLink}>שכחת את הסיסמה?</Text>
                        </Pressable>
                    </View>

                    {error ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <PrimaryButton
                        onPress={onSubmit}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : "התחבר"}
                    </PrimaryButton>
                </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        flexGrow: 1,
        paddingHorizontal: DesignTokens.paddingContainer,
        justifyContent: "center",
        paddingBottom: 40,
    },
    formPanel: {},
    headingBlock: {
        alignItems: "flex-end",
        marginBottom: 20,
    },
    titleText: {
        fontSize: 32,
        fontFamily: "Assistant_700Bold",
        fontWeight: "700",
        color: DesignTokens.textPrimary,
        textAlign: "right",
        letterSpacing: -0.5,
        marginBottom: 6,
        lineHeight: 40,
    },
    subtitleRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    subtitleText: {
        fontSize: 15,
        color: DesignTokens.textSecondary,
        textAlign: "right",
    },
    registerLink: {
        fontSize: 15,
        fontFamily: "Assistant_700Bold",
        fontWeight: "700",
        color: DesignTokens.blue,
        textDecorationLine: "underline",
    },
    dividerAccent: {
        height: 1,
        marginBottom: 24,
    },
    fieldsContainer: {
        gap: 16,
        marginBottom: 28,
    },
    forgotPasswordLink: {
        fontSize: 14,
        color: DesignTokens.blue,
        fontFamily: "Assistant_500Medium",
        fontWeight: "500",
    },
    errorBox: {
        backgroundColor: "#FEF2F2",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 14,
        fontFamily: "Assistant_500Medium",
        fontWeight: "500",
        color: DesignTokens.error,
        textAlign: "right",
    },
});
