import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = {
    children: React.ReactNode;
};

export function Screen({ children }: ScreenProps) {
    return (
        <SafeAreaView className="flex-1 bg-[#F8F9FC]">
            <View className="flex-1">
                {children}
            </View>
        </SafeAreaView>
    );
}
