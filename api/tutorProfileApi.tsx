import { apiClient } from "@/api/apiClient";
import { UPDATE_TUTOR_PROFILE } from "@/constants/apiAddress";

export type UpdateTutorProfileRequest = {
    bio?: string | null;
    tutorImageUrl?: string | null;
    tutorImagePublicId?: string | null;
    hourlyRate?: number | null;
    isActive?: boolean | null;
};

export type TutorProfileDto = {
    bio?: string | null;
    tutorImageUrl?: string | null;
    tutorImagePublicId?: string | null;
    hourlyRate?: number | null;
    isActive?: boolean | null;
};

export async function updateTutorProfile(
    request: UpdateTutorProfileRequest
): Promise<TutorProfileDto> {
    const { data } = await apiClient.put<TutorProfileDto>(
        UPDATE_TUTOR_PROFILE,
        request
    );

    return data;
}

export type MyTutorProfileResponse = {
    bio?: string | null;
    tutorImageUrl?: string | null;
    tutorImagePublicId?: string | null;
};

export const getMyTutorProfile = async (): Promise<MyTutorProfileResponse> => {
    const response = await apiClient.get("/api/tutors/me/profile");
    return response.data;
};