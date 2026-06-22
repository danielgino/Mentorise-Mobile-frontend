import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/hooks/AuthProvider";
import {MessageDto} from "@/types/chat";
import {NotificationDto} from "@/types/notification";
import {
    WS_BASE_URL,
    WS_QUEUE_CHAT,
    WS_QUEUE_NOTIFICATIONS,
    WS_DESTINATION_CHAT_SEND,
    STOMP_VERSIONS,
    WS_RECONNECT_DELAY,
    WS_HEARTBEAT_INCOMING,
    WS_HEARTBEAT_OUTGOING,
    WS_FORCE_BINARY_FRAMES,
    WS_APPEND_MISSING_NULL,
    WS_LOG_RAW_COMMUNICATION,
} from "@/constants/wsConfig";



type WebSocketContextValue = {
    connected: boolean;
    sendChatMessage: (params: {
        conversationId: number;
        content: string;
        clientMessageId?: string;
    }) => string;
    onChatMessage: (handler: (msg: MessageDto) => void) => () => void;
    onNotification: (handler: (notification: NotificationDto) => void) => () => void;
};

const Ctx = createContext<WebSocketContextValue | null>(null);

function getWsUrl() {
    return WS_BASE_URL;
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const { token, loading } = useAuth();

    const clientRef = useRef<Client | null>(null);
    const handlersRef = useRef(new Set<(msg: MessageDto) => void>());
    const notificationHandlersRef = useRef(new Set<(notification: NotificationDto) => void>());

    const [connected, setConnected] = useState(false);

    const value = useMemo<WebSocketContextValue>(() => {
        return {
            connected,

            sendChatMessage: ({ conversationId, content, clientMessageId }) => {
                const id = clientMessageId ?? uuidv4();

                const client = clientRef.current;
                if (!client || !client.connected) {
                    return id;
                }
                client.publish({
                    destination: WS_DESTINATION_CHAT_SEND,
                    body: JSON.stringify({
                        conversationId,
                        content,
                        clientMessageId: id,
                    }),
                });

                return id;
            },

            onChatMessage: (handler) => {
                handlersRef.current.add(handler);
                return () => {
                    handlersRef.current.delete(handler);
                };
            },
            onNotification: (handler) => {
                notificationHandlersRef.current.add(handler);
                return () => {
                    notificationHandlersRef.current.delete(handler);
                };
            },
        };
    }, [connected]);

    useEffect(() => {
        if (loading) return;

        if (!token) {
            setConnected(false);

            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }

            return;
        }

        const client = new Client({
            webSocketFactory: () =>
                new WebSocket(getWsUrl(), STOMP_VERSIONS),

            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },

            forceBinaryWSFrames: WS_FORCE_BINARY_FRAMES,
            appendMissingNULLonIncoming: WS_APPEND_MISSING_NULL,
            logRawCommunication: WS_LOG_RAW_COMMUNICATION,

            reconnectDelay: WS_RECONNECT_DELAY,
            heartbeatIncoming: WS_HEARTBEAT_INCOMING,
            heartbeatOutgoing: WS_HEARTBEAT_OUTGOING,

            debug: __DEV__ ? (str) => console.log("[STOMP]", str) : undefined,

            onConnect: () => {
                setConnected(true);

                client.subscribe(WS_QUEUE_CHAT, (frame: IMessage) => {
                    try {
                        const msg: MessageDto = JSON.parse(frame.body);
                        handlersRef.current.forEach((h) => h(msg));
                    } catch {
                        // malformed frame — discard silently
                    }
                });

                client.subscribe(WS_QUEUE_NOTIFICATIONS, (frame: IMessage) => {
                    try {
                        const notification: NotificationDto = JSON.parse(frame.body);
                        notificationHandlersRef.current.forEach((h) => h(notification));
                    } catch {
                        // malformed frame — discard silently
                    }
                });
            },

            onDisconnect: () => {
                setConnected(false);
            },

            onWebSocketClose: () => {
                setConnected(false);
            },

            onWebSocketError: () => {
                // connection will auto-reconnect via reconnectDelay
            },

            onStompError: () => {
                setConnected(false);
            },
        });
        client.activate();
        clientRef.current = client;

        return () => {
            setConnected(false);
            client.deactivate();
            clientRef.current = null;
        };
    }, [token, loading]);

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWebSocket() {
    const v = useContext(Ctx);
    if (!v) {
        throw new Error("useWebSocket must be used within WebSocketProvider");
    }
    return v;
}
