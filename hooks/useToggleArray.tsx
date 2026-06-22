/**
 * useToggleArray Hook
 * Manage array state with toggle/add/remove operations
 * Useful for checkboxes, multi-select, favoriting, etc.
 */

import { useState, useCallback, useMemo } from "react";

export interface UseToggleArrayReturn<T> {
    items: T[];
    selected: T[];
    selectedIds: (T extends { id: infer ID } ? ID : never)[];

    // Operations
    toggle: (item: T) => void;
    toggleById: (id: T extends { id: infer ID } ? ID : never) => void;
    add: (item: T) => void;
    remove: (item: T) => void;
    removeById: (id: T extends { id: infer ID } ? ID : never) => void;
    clear: () => void;
    setSelected: (items: T[]) => void;

    // State checks
    isSelected: (item: T) => boolean;
    isSelectedById: (id: T extends { id: infer ID } ? ID : never) => boolean;
    count: number;
    isEmpty: boolean;
}

/**
 * Custom hook for managing an array with toggle/select operations
 *
 * Works with any array type, but provides ID-based helpers for objects with `id` property
 *
 * @example
 * // With ID-based items
 * const courses = useToggleArray<Course>([]);
 *
 * return (
 *   <>
 *     {allCourses.map(course => (
 *       <Checkbox
 *         key={course.id}
 *         checked={courses.isSelectedById(course.id)}
 *         onPress={() => courses.toggleById(course.id)}
 *       />
 *     ))}
 *     <Text>Selected: {courses.count}</Text>
 *   </>
 * );
 *
 * @example
 * // With simple values
 * const years = useToggleArray<YearId>([]);
 *
 * const toggleYear = (year: YearId) => {
 *   years.toggle(year);
 * };
 */
export function useToggleArray<T>(
    initialItems: T[] = []
): UseToggleArrayReturn<T> {
    const [selected, setSelected] = useState<T[]>(initialItems);

    // ---- Toggle operations ----

    const toggle = useCallback((item: T) => {
        setSelected((prev) =>
            prev.includes(item)
                ? prev.filter((i) => i !== item)
                : [...prev, item]
        );
    }, []);

    const toggleById = useCallback(
        (id: T extends { id: infer ID } ? ID : never) => {
            setSelected((prev) => {
                const item = prev.find((i: any) => i.id === id);
                if (!item) return prev;
                return prev.includes(item)
                    ? prev.filter((i) => i !== item)
                    : [...prev, item];
            });
        },
        []
    );

    // ---- Add/Remove operations ----

    const add = useCallback((item: T) => {
        setSelected((prev) =>
            prev.includes(item) ? prev : [...prev, item]
        );
    }, []);

    const remove = useCallback((item: T) => {
        setSelected((prev) => prev.filter((i) => i !== item));
    }, []);

    const removeById = useCallback(
        (id: T extends { id: infer ID } ? ID : never) => {
            setSelected((prev) =>
                prev.filter((i: any) => i.id !== id)
            );
        },
        []
    );

    // ---- Clear/Reset ----

    const clear = useCallback(() => {
        setSelected([]);
    }, []);

    // ---- State checks ----

    const isSelected = useCallback(
        (item: T): boolean => selected.includes(item),
        [selected]
    );

    const isSelectedById = useCallback(
        (id: T extends { id: infer ID } ? ID : never): boolean =>
            selected.some((i: any) => i.id === id),
        [selected]
    );

    // ---- Computed values ----

    const count = useMemo(() => selected.length, [selected]);

    const isEmpty = useMemo(() => selected.length === 0, [selected]);

    const selectedIds = useMemo(() => {
        return selected.map((item: any) => item.id);
    }, [selected]) as (T extends { id: infer ID } ? ID : never)[];

    return {
        items: selected,
        selected,
        selectedIds,

        toggle,
        toggleById,
        add,
        remove,
        removeById,
        clear,
        setSelected,

        isSelected,
        isSelectedById,
        count,
        isEmpty,
    };
}

