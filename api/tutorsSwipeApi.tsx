// src/api/tutorsSwipeApi.ts
import { apiClient } from "@/api/apiClient";
import {SWIPE_API} from "@/constants/apiAddress";
import { DEFAULT_SWIPE_LIMIT } from "@/constants/pagination";

export type TutorSwipeItem = {
    id: number;
    fullName: string;
    majorName: string;
    bio: string | null;
    tutorImageUrl: string | null;
    years: number[];
    courses: string[];
    isAlumni: boolean;
    matchReason: string | null;
};

export type TutorSwipeResponse = {
    items: TutorSwipeItem[];
    nextCursor: string | null;
    hasMore: boolean;
    cycleResetSuggested: boolean;
};

export async function getSwipeTutors(params: {
    limit?: number;
    cursor?: string | null;
    excludeIds?: number[];
}): Promise<TutorSwipeResponse> {
    const limit = params.limit ?? DEFAULT_SWIPE_LIMIT;
    const cursor = params.cursor ?? null;
    const excludeIds = params.excludeIds ?? [];

    const query: Record<string, any> = { limit };

    if (cursor) query.cursor = cursor;
    if (excludeIds.length > 0) query.excludeIds = excludeIds.join(",");

    const res = await apiClient.get<TutorSwipeResponse>(SWIPE_API, {
        params: query,
    });

    return res.data;
}
