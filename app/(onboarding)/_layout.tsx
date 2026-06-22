import { Stack } from "expo-router";
import {RegisterProvider} from "@/hooks/RegisterContext";

export default function OnboardingLayout() {
    return (
        <>
                <RegisterProvider>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: "transparent" },
                    }}
                />
                    </RegisterProvider>
        </>
    );
}
