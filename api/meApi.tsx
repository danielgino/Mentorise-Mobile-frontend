
import {apiClient} from "@/api/apiClient";
import {GET_ME} from "@/constants/apiAddress";

export type MeResponse = {
    userId: number;
    fullName: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    role: string;
    majorId: number | null;
    majorName: string;
    isAlumni: boolean;
    hasLearningPreferences: boolean;
    profileImageUrl: string;
    profileImagePublicId:string;
};
export async function getMe(): Promise<MeResponse> {
    const { data } = await apiClient.get<MeResponse>(GET_ME);
    return data;
}

