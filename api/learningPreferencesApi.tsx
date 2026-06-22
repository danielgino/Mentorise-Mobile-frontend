

import {apiClient} from "@/api/apiClient";
import {GET_LEARNING_PREFERENCES, INSERT_LEARNING_PREFERENCES} from "@/constants/apiAddress";

export type ScopeType = "MAJOR" | "COURSE" | "YEAR";

export interface LearningPreferencesDto {
    scopeType: ScopeType;
    years?: number[];
    courseIds?: number[];
}

export type LearningPreferencesViewDto = {
    scopeType: "MAJOR" | "YEAR" | "COURSE";
    yearLabels: string[];
    courseNames: string[];
};

export async function upsertLearningPreferences(dto: LearningPreferencesDto) {
    await apiClient.put(INSERT_LEARNING_PREFERENCES, dto);
}

// 👇 שליפה עבור המשתמש המחובר
export async function getLearningPreferences() {
    const res = await apiClient.get(GET_LEARNING_PREFERENCES);
    return res.data as LearningPreferencesViewDto; // או טיפוס ייעודי לתשובה אם יש
}

