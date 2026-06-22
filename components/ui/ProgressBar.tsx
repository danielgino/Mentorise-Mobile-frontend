import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type ProgressBarProps = {
    total: number;
    active: number;
};

export function ProgressBar({ total, active }: ProgressBarProps) {
    const steps = Array.from({ length: total });

    return (
        <View className="flex-row-reverse gap-2 mb-12">
            {steps.map((_, i) => {
                const isActive = i < active;
                return (
                    <View key={i} className="flex-1 h-1 rounded-full overflow-hidden">
                        {isActive ? (
                            <LinearGradient
                                colors={["#40E0D0", "#2E86DE"]}
                                start={{ x: 1, y: 0.5 }}
                                end={{ x: 0, y: 0.5 }}
                                style={{ height: 4, width: "100%", borderRadius: 999 }}
                            />
                        ) : (
                            <View className="flex-1 h-1 bg-white/10 rounded-full" />
                        )}
                    </View>
                );
            })}
        </View>
    );
}
