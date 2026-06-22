import React, { useEffect } from "react";
import { router } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { useIsFocused } from "@react-navigation/native";
import { InboxScreen } from "@/components/chat/InboxScreen";
import { useUnreadMessages } from "@/hooks/UnreadMessagesProvider";

export default function InboxRoute() {
    const isFocused = useIsFocused();
    const { clearUnread } = useUnreadMessages();

    useEffect(() => {
        if (isFocused) clearUnread();
    }, [isFocused]);

    return (
        <InboxScreen
            onSelectConversation={(id, otherUserId, otherUserName, avatar) =>
                router.push({
                    pathname: "/chat/[id]",
                    params: {
                        id: String(id),
                        otherUserId: String(otherUserId),
                        otherUserName,
                        avatar: avatar ?? "",
                    },
                })
            }
            onPressNewChat={() => router.push(ROUTES.TABS.HOME)}
        />
    );
}