import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments, useGlobalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/hooks/AuthProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MentoBackground } from "@/components/ui/MentoBackground";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { WebSocketProvider } from "@/hooks/WebSocketProvider";
import { KeyboardAvoidingView, Platform, View, ActivityIndicator } from "react-native";
import { NotificationProvider } from "@/hooks/NotificationProvider";
import { UnreadMessagesProvider } from "@/hooks/UnreadMessagesProvider";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
    Assistant_400Regular,
    Assistant_500Medium,
    Assistant_600SemiBold,
    Assistant_700Bold,
} from "@expo-google-fonts/assistant";

SplashScreen.preventAutoHideAsync();

function AppShell() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const segments = useSegments();
    const params = useGlobalSearchParams();

    usePushNotifications();

    useEffect(() => {
        if (loading) return;

        const firstSegment = segments[0];
        const secondSegment = segments[1];
        const mode = params.mode as string | undefined;

        // Always allow reset-password regardless of auth state (deep link from email)
        if (firstSegment === "reset-password") return;

        // User not authenticated
        if (!user) {
            // Allow (auth) and (onboarding) for unauthenticated users
            if (firstSegment === "(auth)" || firstSegment === "(onboarding)") {
                return;
            }
            // Redirect to login for any other route
            router.replace("/(auth)/login");
            return;
        }

        // User is authenticated
        // Block access to (auth) group completely
        if (firstSegment === "(auth)") {
            router.replace("/(tabs)");
            return;
        }

        // Allow (onboarding) only with specific modes and screens
        if (firstSegment === "(onboarding)") {
            const editScreens = ["learning-type", "year-select", "course-select"];
            const signupScreens = [
                "register",
                "major-select",
                "academic-status",
                "learning-type",
                "year-select",
                "course-select",
                "welcome-page",
                "finding",
            ];

            const isEditMode = mode === "edit" && editScreens.includes(secondSegment as string);
            const isSignupMode = mode === "signup" && signupScreens.includes(secondSegment as string);

            // If not in allowed mode, redirect to tabs
            if (!isEditMode && !isSignupMode) {
                router.replace("/(tabs)");
                return;
            }
        }
    }, [loading, user, segments, params, router]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator color="#2E86DE" size="large" />
            </View>
        );
    }

    return (
        <WebSocketProvider>
            <UnreadMessagesProvider>
            <NotificationProvider>
                <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                    >
                        <Stack
                            screenOptions={{
                                headerShown: false,
                                contentStyle: { backgroundColor: "transparent" },
                            }}
                        >
                            <Stack.Screen name="(auth)" />
                            <Stack.Screen name="(onboarding)" />
                            <Stack.Screen name="(tabs)" />
                            <Stack.Screen name="reset-password" />
                            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
                        </Stack>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </NotificationProvider>
            </UnreadMessagesProvider>
        </WebSocketProvider>
    );
}

export default function RootLayout() {
    const colorScheme = useColorScheme();

    const [fontsLoaded] = useFonts({
        Assistant_400Regular,
        Assistant_500Medium,
        Assistant_600SemiBold,
        Assistant_700Bold,
    });

    useEffect(() => {
        if (fontsLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    const TransparentLightTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: "transparent",
            card: "transparent",
        },
    };

    const TransparentDarkTheme = {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            background: "transparent",
            card: "transparent",
        },
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ThemeProvider value={colorScheme === "dark" ? TransparentDarkTheme : TransparentLightTheme}>
                    <MentoBackground>
                        <AuthProvider>
                            <AppShell />
                        </AuthProvider>
                        <StatusBar style="dark" />
                    </MentoBackground>
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}