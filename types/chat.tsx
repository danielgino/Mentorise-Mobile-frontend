export type MessageDto = {
    id: number;
    clientMessageId?: string;
    conversationId: number;
    senderId: number;
    type: string;
    content: string;
    sentAt: string;
};

export type ConversationIdDto = {
    conversationId: number;
};

export type InboxItemDto = {
    conversationId: number;
    otherUserId: number;
    otherFirstName: string;
    otherLastName: string;
    otherProfileImageUrl?: string | null;
    lastMessageId?: number | null;
    lastMessageType?: string | null;
    lastMessageContent?: string | null;
    lastMessageAt?: string | null;
    unreadCount: number;
};

export type SendMessageRequest = {
    content: string;
    clientMessageId: string;
};
export type GetMessagesParams = {
    cursorId?: number;
    limit?: number;
};