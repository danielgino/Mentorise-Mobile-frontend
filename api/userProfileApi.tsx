import { apiClient } from "@/api/apiClient";
import {
    UPDATE_MY_PHONE,
    UPDATE_MY_PROFILE_IMAGE,
    DELETE_MY_PROFILE_IMAGE,
} from "@/constants/apiAddress";

export type UpdateProfileImagePayload = {
    profileImageUrl: string;
    profileImagePublicId: string;
};

export type UploadProfileImageResponse = {
    profileImageUrl?: string;
    profileImagePublicId?: string;
};
type UpdatePhoneRequest = {
    phoneNumber: string;
};

export async function updateMyPhone(request: UpdatePhoneRequest): Promise<string> {
    const { data } = await apiClient.patch<string>(UPDATE_MY_PHONE, request);
    return data;
}
export async function updateMyProfileImage(
    payload: UpdateProfileImagePayload
): Promise<UploadProfileImageResponse> {
    const { data } = await apiClient.put<UploadProfileImageResponse>(
        UPDATE_MY_PROFILE_IMAGE,
        payload
    );

    return data;
}

export async function deleteMyProfileImage(): Promise<void> {
    await apiClient.delete(DELETE_MY_PROFILE_IMAGE);
}