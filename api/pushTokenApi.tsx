import { apiClient } from "@/api/apiClient";

export async function registerPushToken(token: string, platform: string): Promise<void> {
    await apiClient.post("/api/users/me/push-token", { token, platform });
}
