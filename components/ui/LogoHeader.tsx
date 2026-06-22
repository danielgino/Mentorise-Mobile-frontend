import React from "react";
import { View, Text, Platform } from "react-native";
import Animated, { ZoomIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { GraduationCap } from "lucide-react-native";
import { GRADIENT_COLORS_PRIMARY } from "@/constants/theme";

export function LogoHeader() {
    const TITLE_SIZE = 52;
    const TITLE_LINE = 60;
    const MASK_H = 62;

    return (
        <Animated.View
            entering={FadeInDown.duration(500).delay(100).springify()}
            className="mb-12"
        >
            <View style={{ alignItems: "center", gap: 16 }}>

                {/* Icon — standalone, glowing */}
                <Animated.View entering={ZoomIn.duration(400).delay(200).springify()}>
                    {/* Outer glow ring */}
                    <View style={{
                        position: "absolute",
                        inset: -10,
                        borderRadius: 999,
                        backgroundColor: "transparent",
                        ...Platform.select({
                            ios: {
                                shadowColor: "#2E86DE",
                                shadowOpacity: 0.22,
                                shadowRadius: 18,
                                shadowOffset: { width: 0, height: 4 },
                            },
                            android: { elevation: 0 },
                        }),
                    }} />

                    {/* Gradient border ring */}
                    <LinearGradient
                        colors={GRADIENT_COLORS_PRIMARY}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            width: 72,
                            height: 72,
                            borderRadius: 999,
                            padding: 2,
                            ...Platform.select({
                                android: { elevation: 12 },
                            }),
                        }}
                    >
                        {/* Inner dark circle */}
                        <View style={{
                            flex: 1,
                            borderRadius: 999,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#0C0F1E",
                            borderWidth: 1,
                            borderColor: "rgba(255,255,255,0.08)",
                        }}>
                            {/* Icon inner glow */}
                            <LinearGradient
                                colors={["rgba(64,224,208,0.22)", "rgba(166,108,255,0.14)"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    borderRadius: 999,
                                }}
                            />
                            <GraduationCap size={30} color="#FFFFFF" />
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* App name — gradient text, clean and large */}
                <View>
                    <MaskedView
                        style={{ height: MASK_H, width: 300 }}
                        maskElement={
                            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        fontSize: TITLE_SIZE,
                                        fontFamily: "Assistant_700Bold",
                                        fontWeight: "700",
                                        letterSpacing: -1,
                                        lineHeight: TITLE_LINE,
                                        backgroundColor: "transparent",
                                        textAlign: "center",
                                        includeFontPadding: false,
                                    }}
                                >
                                    Mentorise
                                </Text>
                            </View>
                        }
                    >
                        <LinearGradient
                            colors={GRADIENT_COLORS_PRIMARY}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={{ flex: 1 }}
                        />
                    </MaskedView>

                    {/* Thin gradient underline accent */}
                    <LinearGradient
                        colors={["transparent", ...GRADIENT_COLORS_PRIMARY, "transparent"]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={{
                            height: 1.5,
                            marginTop: 2,
                            borderRadius: 999,
                            opacity: 0.45,
                        }}
                    />
                </View>
            </View>
        </Animated.View>
    );
}