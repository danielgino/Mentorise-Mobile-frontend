
import {apiClient} from "@/api/apiClient";
import {TutorApplicationCreateRequest, TutorApplicationStatusResponse, TutorScopeDto} from "@/types/tutorApplications";
import {CREATE_TUTOR_APPLICATION, GET_MY_PENDING_APPLICATION, GET_MY_TUTOR_SCOPES, GET_TUTOR_PROFILE} from "@/constants/apiAddress";

export async function createTutorApplicationJSON(req: TutorApplicationCreateRequest) {
    const { data } = await apiClient.post<TutorApplicationCreateRequest>(CREATE_TUTOR_APPLICATION, req);
    return data;
}

export async function getTutorProfile(userId: number) {
    const { data } = await apiClient.get(GET_TUTOR_PROFILE(userId));
    return data;
}

export async function getMyPendingApplication(): Promise<TutorApplicationStatusResponse> {
    const { data } = await apiClient.get<TutorApplicationStatusResponse>(GET_MY_PENDING_APPLICATION);
    return data;
}

export async function getMyApprovedScopes(): Promise<TutorScopeDto[]> {
    const { data } = await apiClient.get<TutorScopeDto[]>(GET_MY_TUTOR_SCOPES);
    return data;
}
