
export type ApiCourse = {
    id: number;
    courseCode: string;
    name: string;
    year: number;
    semester: "A" | "B" | "SUMMER" | string;
};
export  type Course = {
    id: number;
    name: string;
    code: string;
    year: string;      // "שנה א׳"
    semester: string;  // "סמסטר א׳"
};

export const yearLabel = (year: number) => {
    const map: Record<number, string> = { 1: "שנה א׳", 2: "שנה ב׳", 3: "שנה ג׳", 4: "שנה ד׳" };
    return map[year] ?? `שנה ${year}`;
};

export const semesterLabel = (s: string) => {
    const map: Record<string, string> = { A: "סמסטר א׳", B: "סמסטר ב׳", SUMMER: "קיץ" };
    return map[s] ?? s;
};


export const mapApiCourseToUi = (c: ApiCourse): Course => ({
    id: c.id,
    name: c.name,
    code: c.courseCode,
    year: yearLabel(c.year),
    semester: semesterLabel(c.semester),
});
