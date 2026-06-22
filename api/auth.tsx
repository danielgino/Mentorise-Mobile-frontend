import {apiClient, setAuthHeader} from "@/api/apiClient";
import {saveToken} from "@/auth/tokens";
import {publicApiClient} from "@/api/publicApiClient";
import {LOGIN_REQUEST, REGISTER_REQUEST, LOGOUT_REQUEST, FORGOT_PASSWORD_REQUEST, RESET_PASSWORD_REQUEST} from "@/constants/apiAddress";
export type RegisterRequest = {
    nationalId: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    isAlumni: boolean;
    majorId: number;
};

export type RegisterResponse = {
    id: number;
    message: string;
};

export type LoginResponse = {
    token: string;
    id: number;
    fullName: string;
    email: string;
    role: string;
    majorId: number;
};


export async function login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await publicApiClient.post<LoginResponse>(LOGIN_REQUEST, {email, password});
    await saveToken(data.token);
    setAuthHeader(data.token);
    return data;
}

export async function registerUser(dto: RegisterRequest): Promise<RegisterResponse> {
    const res = await publicApiClient.post<RegisterResponse>(
        REGISTER_REQUEST,
        dto
    );
    return res.data;
}

export async function logout(): Promise<void> {
    await apiClient.post(LOGOUT_REQUEST);
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await publicApiClient.post<{ message: string }>(
        FORGOT_PASSWORD_REQUEST, { email }
    );
    return data;
}

export async function resetPassword(
    token: string,
    newPassword: string
): Promise<{ message: string }> {
    const { data } = await publicApiClient.post<{ message: string }>(
        RESET_PASSWORD_REQUEST, { token, newPassword }
    );
    return data;
}
