import { getCompletedSessionOffers, type SessionOfferCardDto } from "@/api/sessionApi";

// ─── Types (match the future backend API contract) ───────────────────────────

export type EarningLesson = {
    sessionOfferId: number;
    studentName: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    price: number;
    status: string;
};

export type CycleStatus = "CURRENT" | "PENDING_PAYOUT" | "PAID";

export type PaymentCycle = {
    cycleId: number;
    month: number;
    year: number;
    cycleStart: string;
    cycleEnd: string;
    totalEarned: number;
    lessonCount: number;
    status: CycleStatus;
    lessons?: EarningLesson[];
};

export type CyclesPage = {
    content: PaymentCycle[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
};

// ─── Interim helpers (client-side grouping from completed sessions) ───────────

function monthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function sessionToLesson(s: SessionOfferCardDto): EarningLesson {
    const durationMinutes = Math.round(
        (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60_000
    );
    return {
        sessionOfferId: s.id,
        studentName: s.studentFullName,
        startTime: s.startTime,
        endTime: s.endTime,
        durationMinutes,
        price: s.price,
        status: s.status,
    };
}

function buildCycle(
    key: string,
    sessions: SessionOfferCardDto[],
    status: CycleStatus,
    includeLessons: boolean
): PaymentCycle {
    const [yearStr, monthStr] = key.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const lastDay = new Date(year, month, 0).getDate();
    const pad = (n: number) => String(n).padStart(2, "0");

    const sorted = [...sessions].sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    return {
        cycleId: year * 100 + month,
        month,
        year,
        cycleStart: `${year}-${pad(month)}-01T00:00:00`,
        cycleEnd: `${year}-${pad(month)}-${pad(lastDay)}T23:59:59`,
        totalEarned: sessions.reduce((sum, s) => sum + s.price, 0),
        lessonCount: sessions.length,
        status,
        lessons: includeLessons ? sorted.map(sessionToLesson) : undefined,
    };
}

function groupByMonth(
    sessions: SessionOfferCardDto[],
    tutorUserId: number
): Map<string, SessionOfferCardDto[]> {
    const map = new Map<string, SessionOfferCardDto[]>();
    for (const s of sessions) {
        if (s.tutorUserId !== tutorUserId) continue;
        const key = monthKey(new Date(s.startTime));
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(s);
    }
    return map;
}

// ─── Public API functions (signatures match the future backend contract) ──────

/**
 * Returns the tutor's current (this month) payment cycle with lessons.
 * INTERIM: derived from the existing /completed endpoint.
 * Replace the body with a GET to GET_TUTOR_CURRENT_CYCLE when the backend is ready.
 */
export async function getCurrentCycle(tutorUserId: number): Promise<PaymentCycle> {
    const sessions = await getCompletedSessionOffers();
    const current = monthKey(new Date());
    const grouped = groupByMonth(sessions, tutorUserId);
    return buildCycle(current, grouped.get(current) ?? [], "CURRENT", true);
}

/**
 * Returns a paginated list of the tutor's past payment cycles (previous months).
 * INTERIM: derived from the existing /completed endpoint.
 * Replace the body with a GET to GET_TUTOR_PAYMENT_CYCLES when the backend is ready.
 */
export async function getPreviousCycles(
    tutorUserId: number,
    page: number,
    size: number
): Promise<CyclesPage> {
    const sessions = await getCompletedSessionOffers();
    const current = monthKey(new Date());
    const grouped = groupByMonth(sessions, tutorUserId);

    const keys = Array.from(grouped.keys())
        .filter((k) => k < current)
        .sort((a, b) => b.localeCompare(a));

    const totalElements = keys.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));
    const start = page * size;
    const pageKeys = keys.slice(start, start + size);

    return {
        content: pageKeys.map((k) => buildCycle(k, grouped.get(k)!, "PAID", false)),
        page,
        size,
        totalElements,
        totalPages,
        last: start + size >= totalElements,
    };
}
