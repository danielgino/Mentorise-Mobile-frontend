import React from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ChatThreadScreen } from "@/components/chat/ChatThreadScreen";
import { useAuth } from "@/hooks/AuthProvider";
import { ROUTES } from "@/constants/routes";

function getSingleParam(value: string | string[] | undefined) {
    if (Array.isArray(value)) return value[0];
    return value;
}

export default function ChatConversationScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useAuth();

    const conversationId = Number(getSingleParam(params.id));
    const otherUserId = Number(getSingleParam(params.otherUserId));
    const otherUserName = getSingleParam(params.otherUserName) ?? "צ'אט";
    const avatar = getSingleParam(params.avatar);

    if (
        !conversationId ||
        Number.isNaN(conversationId) ||
        !otherUserId ||
        Number.isNaN(otherUserId) ||
        !user?.userId
    ) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F8F9FC] px-6">
                <Text className="text-[#1A1A2E] text-center">חסרים פרטי שיחה</Text>
            </View>
        );
    }

    return (
        <ChatThreadScreen
            conversationId={conversationId}
            currentUserId={user.userId}
            currentUserRole={user.role}
            otherUserId={otherUserId}
            otherUserName={otherUserName}
            avatar={avatar}
            onBack={() => router.back()}
            onOpenLessons={() => router.push("/lessons")}
            onPressProfile={
                otherUserId && !Number.isNaN(otherUserId)
                    ? () => router.push({ pathname: ROUTES.TUTOR_PROFILE, params: { id: String(otherUserId) } })
                    : undefined
            }
        />
    );
}