
// ============================================
// 2026 Light Design System — primary tokens
// ============================================

export const DesignTokens = {
  // Backgrounds
  bg:               '#F8F9FC',
  surface:          '#FFFFFF',
  surfaceSecondary: '#F0F4FF',

  // Borders
  border:      'rgba(0,0,0,0.07)',
  borderStrong:'rgba(0,0,0,0.12)',
  inputBorder: '#E5E7EB',

  // Border radius
  radiusCard:   12,
  radiusButton:  8,
  radiusInput:   8,
  radiusPill:  999,

  // Typography
  textPrimary:   '#1A1A2E',
  textSecondary: '#6B7280',
  textHint:      '#9CA3AF',

  // Brand
  blue:   '#2E86DE',
  purple: '#A66CFF',
  teal:   '#40E0D0',

  // Semantic
  success: '#1D9E75',
  warning: '#D97706',
  error:   '#E24B4A',

  // Spacing
  paddingContainer: 20,
  paddingBetween:   16,
} as const;

// Legacy Colors object — kept for backward compatibility with useThemeColor
export const Colors = {
  light: {
    text:           DesignTokens.textPrimary,
    background:     DesignTokens.bg,
    tint:           DesignTokens.blue,
    icon:           DesignTokens.textSecondary,
    tabIconDefault: DesignTokens.textHint,
    tabIconSelected:DesignTokens.blue,
  },
  dark: {
    text:           DesignTokens.textPrimary,
    background:     DesignTokens.bg,
    tint:           DesignTokens.blue,
    icon:           DesignTokens.textSecondary,
    tabIconDefault: DesignTokens.textHint,
    tabIconSelected:DesignTokens.blue,
  },
};

// ============================================
// Gradient Colors
// ============================================

// Primary gradient: Blue → Purple (buttons, rings, accents)
export const GRADIENT_COLORS_PRIMARY = ["#2E86DE", "#A66CFF"] as const;

// Teal accent kept as a standalone constant for any component that still needs it
export const COLOR_TEAL = "#40E0D0";

/**
 * Gradient start point (top-left)
 */
export const GRADIENT_START = { x: 0, y: 0 };

/**
 * Gradient end point (bottom-right)
 */
export const GRADIENT_END = { x: 1, y: 1 };

/**
 * Gradient end point (right)
 * Used for horizontal gradients (like badges)
 */
export const GRADIENT_END_HORIZONTAL = { x: 1, y: 0 };

export const Fonts = {
  sans:         'Assistant_400Regular',
  sansMedium:   'Assistant_500Medium',
  sansSemiBold: 'Assistant_600SemiBold',
  sansBold:     'Assistant_700Bold',
  serif:        'serif',
  mono:         'monospace',
};
