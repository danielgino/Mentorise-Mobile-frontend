/**
 * Date & Time Formatting Utilities
 * Centralized functions for consistent date/time formatting across the app
 */

/**
 * Format ISO timestamp to time string (HH:MM format)
 * Example: "2025-04-05T14:30:00" → "14:30"
 */
export function formatMessageTime(value: string): string {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Format ISO timestamp to time string (same as formatMessageTime)
 * Used in inbox/conversation lists
 */
export function formatInboxTime(value?: string | null): string {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Get unique day key for grouping messages by date
 * Example: "2025-04-05T14:30:00" → "2025-4-5"
 */
export function getDayKey(value?: string): string {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/**
 * Format date to human-readable label
 * Returns: "היום" (Today), "אתמול" (Yesterday), or full date
 */
export function formatDayLabel(value?: string): string {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const now = new Date();
    const isSameDay =
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate();

    if (isSameDay) return "היום";

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
        date.getFullYear() === yesterday.getFullYear() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getDate() === yesterday.getDate();

    if (isYesterday) return "אתמול";

    // Return formatted date: "5 באפריל"
    return date.toLocaleDateString("he-IL", {
        day: "numeric",
        month: "long",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
}

const HEBREW_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const HEBREW_MONTHS = [
    "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

/**
 * WhatsApp-style smart timestamp for notifications (Hebrew):
 *   Today     → "14:32"
 *   Yesterday → "אתמול"
 *   2–6 days  → Hebrew day name ("שני", "שלישי" …)
 *   Older     → Hebrew date ("8 באפריל", "8 באפריל 2024" for a different year)
 */
export function formatNotificationTime(createdAt: string): string {
    if (!createdAt) return "";

    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((today.getTime() - msgDay.getTime()) / 86_400_000);

    if (diffDays === 0) {
        return date.toLocaleTimeString("he-IL", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    }

    if (diffDays === 1) return "אתמול";

    if (diffDays < 7) return HEBREW_DAYS[date.getDay()];

    const day = date.getDate();
    const month = HEBREW_MONTHS[date.getMonth()];
    const yearSuffix = date.getFullYear() !== now.getFullYear() ? ` ${date.getFullYear()}` : "";
    return `${day} ב${month}${yearSuffix}`;
}

