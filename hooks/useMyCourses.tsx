// hooks/useMyCourses.ts
import {useCallback, useEffect, useState} from "react";
import {getMyCourses} from "@/api/courseApi";
import {mapApiCourseToUi, type Course} from "@/types/course";

let cached: Course[] | null = null;
let cachedYears: number[] | null = null;
let cachedAt = 0;
const TTL = 60_000;

type Options = { enabled?: boolean; useCache?: boolean };

export function useMyCourses(opts: Options = {}) {
    const { enabled = true, useCache = true } = opts;

    const [courses, setCourses] = useState<Course[]>(cached ?? []);
    const [availableYears, setAvailableYears] = useState<number[]>(cachedYears ?? []);
    const [loading, setLoading] = useState<boolean>(enabled && (!useCache || !cached));
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async (force = false) => {
        try {
            setError(null);
            setLoading(true);

            const now = Date.now();
            const fresh = useCache && cached && now - cachedAt < TTL;
            if (!force && fresh) {
                setCourses(cached!);
                setAvailableYears(cachedYears ?? []);
                return;
            }

            const api = await getMyCourses();
            const mapped = api.map(mapApiCourseToUi);
            const years = [...new Set(api.map(c => c.year))].sort((a, b) => a - b);
            if (useCache) {
                cached = mapped;
                cachedYears = years;
                cachedAt = now;
            }
            setCourses(mapped);
            setAvailableYears(years);
        } catch (e: any) {
            setError(e?.message ?? "שגיאה בטעינת קורסים");
        } finally {
            setLoading(false);
        }
    }, [useCache]);

    useEffect(() => {
        if (!enabled) return;
        const fresh = useCache && cached && Date.now() - cachedAt < TTL;
        if (!fresh) void load(); else setLoading(false);
    }, [enabled, useCache, load]);

    const refresh = useCallback(() => load(true), [load]);

    return { courses, availableYears, loading, error, load, refresh };
}

export function clearCoursesCache() {
    cached = null;
    cachedYears = null;
    cachedAt = 0;
}
