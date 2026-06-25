import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenProps = {
    children: React.ReactNode;
};

export function Screen({ children }: ScreenProps) {
    const insets = useSafeAreaInsets();
    return (
        <View className="flex-1 bg-[#F8F9FC]" style={{ paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }}>
            <View className="flex-1">
                {children}
            </View>
        </View>
    );
}
