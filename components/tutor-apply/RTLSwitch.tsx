import { Switch, Text, View } from "react-native";

export default function RTLSwitch({
                                      label,
                                      checked,
                                      onChange,
                                  }: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <View className="flex-row items-center justify-between">
            <Text className="text-right text-sm text-[#111827]">{label}</Text>
            <Switch value={checked} onValueChange={onChange} />
        </View>
    );
}
