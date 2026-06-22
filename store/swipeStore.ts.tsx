import { create } from "zustand";
import type { TutorSwipeItem } from "@/api/tutorsSwipeApi";

type SwipeState = {
    initialTutors: TutorSwipeItem[] | null;
    initialNextCursor: string | null;
    initialHasMore: boolean;
    setInitial: (
        tutors: TutorSwipeItem[],
        nextCursor: string | null,
        hasMore: boolean
    ) => void;
    clear: () => void;
};

export const useSwipeStore = create<SwipeState>((set) => ({
    initialTutors: null,
    initialNextCursor: null,
    initialHasMore: true,
    setInitial: (tutors, nextCursor, hasMore) =>
        set({
            initialTutors: tutors,
            initialNextCursor: nextCursor,
            initialHasMore: hasMore,
        }),
    clear: () =>
        set({
            initialTutors: null,
            initialNextCursor: null,
            initialHasMore: true,
        }),
}));