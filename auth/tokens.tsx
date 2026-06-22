import { Platform } from "react-native";


const KEY = "mentorise_token";

export async function saveToken(token: string) {
    if (Platform.OS === "web") localStorage.setItem(KEY, token);
    else {
        const SecureStore = await import("expo-secure-store");
        await SecureStore.setItemAsync(KEY, token);
    }
}
export async function getToken() {
    if (Platform.OS === "web") return localStorage.getItem(KEY);
    const SecureStore = await import("expo-secure-store");
    return SecureStore.getItemAsync(KEY);
}
export async function clearToken() {
    if (Platform.OS === "web") localStorage.removeItem(KEY);
    else {
        const SecureStore = await import("expo-secure-store");
        await SecureStore.deleteItemAsync(KEY);
    }
}
