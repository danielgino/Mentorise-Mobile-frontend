import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AppBarProps = {
    title: string;
    onBack?: () => void;
};

export default function AppBar({ title, onBack }: AppBarProps) {
    const insets = useSafeAreaInsets();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.row}>
                <View style={styles.spacer} />

                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>

                <Pressable
                    onPress={handleBack}
                    style={styles.backBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <ArrowRight size={22} color="#1A1A2E" />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "transparent",
    },
    row: {
        height: 44,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        flex: 1,
        textAlign: "center",
        fontSize: 16,
        fontFamily: "Assistant_500Medium",
        fontWeight: "500",
        color: "#1A1A2E",
    },
    spacer: {
        width: 40,
    },
});
