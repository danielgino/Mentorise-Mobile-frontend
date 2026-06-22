import { apiClient } from "@/api/apiClient";
import {ConversationIdDto, GetMessagesParams, InboxItemDto, MessageDto, SendMessageRequest} from "@/types/chat";
import {
    GET_CONVERSATION,
    GET_INBOX_LIST,
    GET_MESSAGES,
    MARK_AS_READ_MESSAGES,
    SEND_MESSAGE
} from "@/constants/apiAddress";
import { DEFAULT_INBOX_LIMIT, DEFAULT_MESSAGES_LIMIT } from "@/constants/pagination";



export async function getOrCreateConversation(otherUserId: number): Promise<ConversationIdDto> {
    const { data } = await apiClient.post<ConversationIdDto>(
        GET_CONVERSATION(otherUserId)
    );
    return data;
}

export async function getInbox(limit = DEFAULT_INBOX_LIMIT): Promise<InboxItemDto[]> {
    const { data } = await apiClient.get<InboxItemDto[]>(GET_INBOX_LIST, {
        params: { limit },
    });
    return data;
}

export async function getMessages(
    conversationId: number,
    params?: GetMessagesParams
): Promise<MessageDto[]> {
    const { data } = await apiClient.get<MessageDto[]>(
        GET_MESSAGES(conversationId),
        {
            params: {
                cursorId: params?.cursorId,
                limit: params?.limit ?? DEFAULT_MESSAGES_LIMIT,
            },
        }
    );
    return data;
}

export async function sendMessage(
    conversationId: number,
    body: SendMessageRequest
): Promise<MessageDto> {
    const { data } = await apiClient.post<MessageDto>(
        SEND_MESSAGE(conversationId),
        body
    );
    return data;
}

export async function markConversationAsRead(conversationId: number): Promise<void> {
    await apiClient.post(MARK_AS_READ_MESSAGES(conversationId));
}

export const chatApi = {
    getOrCreateConversation,
    getInbox,
    getMessages,
    sendMessage,
    markConversationAsRead,
};

