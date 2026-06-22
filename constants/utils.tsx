

export const roleLabel = (s: string) => {
    const map: Record<string, string> = { STUDENT: "סטודנט", TUTOR: "מתרגל", ADMIN: "מנהל מערכת" };
    return map[s] ?? s;
};

export { formatNotificationTime } from "@/constants/dateUtils";

// ============================================
// Router & Common Utilities
// ============================================

/**
 * Extract single value from potentially array parameter (from router)
 * Used in Expo Router dynamic routes where params can be string or string[]
 *
 * @example
 * const id = getSingleParam(params.id); // handles both "123" and ["123"]
 */
export function getSingleParam(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) return value[0];
    return value;
}

/**
 * Add timeout to a promise
 * Rejects with timeout error if promise takes longer than specified ms
 *
 * @example
 * const data = await withTimeout(fetchData(), 5000);
 */
export function withTimeout<T>(promise: Promise<T>, ms: number = 3500): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
        ),
    ]);
}

/**
 * Combine first and last name into full name
 *
 * @example
 * getFullName("John", "Doe") // "John Doe"
 * getFullName("", "Doe") // "Doe"
 * getFullName(undefined, undefined) // ""
 */
export function getFullName(firstName?: string | null, lastName?: string | null): string {
    return `${firstName ?? ""} ${lastName ?? ""}`.trim();
}

