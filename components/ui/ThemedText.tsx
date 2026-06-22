import { Text, TextProps } from 'react-native';
import { DesignTokens } from '@/constants/theme';

export function ThemedText(props: TextProps) {
    return (
        <Text
            {...props}
            style={[{ color: DesignTokens.textPrimary, fontFamily: 'Assistant_400Regular' }, props.style]}
        />
    );
}