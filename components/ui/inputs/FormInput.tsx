import React, {
    useMemo,
    useState,
    ReactElement,
    isValidElement,
    cloneElement,
} from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";

type LucideIconElement = ReactElement<{ color?: string; size?: number }>;

type FormInputProps = {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
    labelColor?: string;
    className?: string;
    error?: string;
    helperText?: string;

    rightIcon?: LucideIconElement;
    leftIcon?: LucideIconElement;

    iconColor?: string;
    iconSize?: number;

    transform?: (v: string) => string;
    onBlurValidate?: (v: string) => string | undefined;
    showPasswordToggle?: boolean;

    editable?: boolean;
    selectTextOnFocus?: boolean;

    /** "dark" = default theme (light bg, dark text)
     *  "light" = RTLTextArea theme (white bg, dark text, light border)
     *  "search" = SearchField theme (search icon, light, no label) */
    variant?: "dark" | "light" | "search";

    /** Multiline textarea — used with variant="light" */
    multiline?: boolean;
};

const decorateIcon = (
    icon: LucideIconElement | undefined,
    color: string,
    size: number
) => {
    if (!icon || !isValidElement(icon)) return null;

    const nextProps: { color?: string; size?: number } = {};
    if (icon.props.color == null) nextProps.color = color;
    if (icon.props.size == null) nextProps.size = size;

    return Object.keys(nextProps).length ? cloneElement(icon, nextProps) : icon;
};

export function FormInput({
    label,
    value,
    onChange,
    placeholder,
    secureTextEntry = false,
    keyboardType = "default",
    labelColor = "#1A1A2E",
    className = "",
    error,
    helperText,

    rightIcon,
    leftIcon,
    iconColor = "#6B7280",
    iconSize = 20,

    transform,
    onBlurValidate,
    showPasswordToggle = false,

    editable = true,
    selectTextOnFocus = true,

    variant = "dark",
    multiline = false,
}: FormInputProps) {
    const [focused, setFocused] = useState(false);
    const [localError, setLocalError] = useState<string | undefined>(undefined);
    const [reveal, setReveal] = useState(false);

    const hasError = !!(error ?? localError);

    const borderColor = useMemo(() => {
        if (hasError) return "#E24B4A";
        return focused ? "#2E86DE" : "#E5E7EB";
    }, [focused, hasError]);

    const handleChange = (text: string) =>
        onChange(transform ? transform(text) : text);

    const handleBlur = () => {
        setFocused(false);
        if (!editable) return;
        if (onBlurValidate) setLocalError(onBlurValidate(value));
    };

    // ─── search variant ────────────────────────────────────────────────────────
    if (variant === "search") {
        return (
            <View
                className={[
                    "flex-row items-center border border-[#E5E7EB] rounded-2xl px-4 h-12 bg-white",
                    className,
                ].join(" ")}
            >
                <Ionicons name="search" size={18} color="#6B7280" />
                <TextInput
                    value={value}
                    onChangeText={handleChange}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 mr-3"
                    style={{ textAlign: "right" }}
                />
            </View>
        );
    }

    // ─── light variant (RTLTextArea) ───────────────────────────────────────────
    if (variant === "light") {
        return (
            <View className={className}>
                {label ? (
                    <Text className="text-right text-sm font-bold text-[#111827] mb-2">
                        {label}
                    </Text>
                ) : null}
                <TextInput
                    value={value}
                    onChangeText={handleChange}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    multiline={multiline}
                    editable={editable}
                    className={[
                        "px-4 py-3 rounded-2xl border border-[#E5E7EB] bg-white",
                        multiline ? "min-h-[120px]" : "",
                    ].join(" ")}
                    style={{
                        textAlign: "right",
                        ...(multiline && { textAlignVertical: "top" }),
                    }}
                />
            </View>
        );
    }

    // ─── dark variant (default — now light design) ─────────────────────────────
    const borderWidth = focused ? 2 : 1;

    const hasRight = !!rightIcon;
    const hasLeft = !!leftIcon || showPasswordToggle;

    return (
        <View className={`w-full ${className}`}>
            {label ? (
                <Text
                    className="mb-2 text-right font-semibold text-base"
                    style={{ color: labelColor }}
                >
                    {label}
                </Text>
            ) : null}

            <View className="relative">
                {rightIcon && (
                    <View className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
                        {decorateIcon(rightIcon, iconColor, iconSize)}
                    </View>
                )}

                {showPasswordToggle ? (
                    <Pressable
                        onPress={() => setReveal((r) => !r)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
                        hitSlop={10}
                    >
                        {reveal ? (
                            <EyeOff color={iconColor} size={iconSize} />
                        ) : (
                            <Eye color={iconColor} size={iconSize} />
                        )}
                    </Pressable>
                ) : (
                    leftIcon && (
                        <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                            {decorateIcon(leftIcon, iconColor, iconSize)}
                        </View>
                    )
                )}

                <TextInput
                    value={value}
                    onChangeText={handleChange}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={showPasswordToggle ? !reveal : secureTextEntry}
                    keyboardType={keyboardType}
                    textAlign="right"
                    onFocus={() => setFocused(true)}
                    onBlur={handleBlur}
                    editable={editable}
                    selectTextOnFocus={editable && selectTextOnFocus}
                    multiline={multiline}
                    className={[
                        "w-full px-4 py-3 rounded-xl text-[#1A1A2E] text-base bg-white border",
                        hasRight ? "pr-10" : "",
                        hasLeft ? "pl-10" : "",
                    ].join(" ")}
                    style={{ borderColor, borderWidth }}
                />
            </View>

            {helperText && !hasError && (
                <Text className="mt-1 text-xs text-[#6B7280] text-right">
                    {helperText}
                </Text>
            )}
            {hasError && (
                <Text className="mt-1 text-xs text-[#E24B4A] text-right">
                    {error ?? localError}
                </Text>
            )}
        </View>
    );
}
