/**
 * WebSocket & STOMP Configuration Constants
 * Centralized configuration for real-time messaging
 */

import { BASE_URL } from "@/api/apiClient";

// ============================================
// WebSocket URLs
// ============================================
// Derived from BASE_URL: http→ws, https→wss, appended with /ws
export const WS_BASE_URL = (BASE_URL ?? "").replace(/^http/, "ws") + "/ws";

// ============================================
// STOMP Queue Paths (User Subscriptions)
// ============================================
export const WS_QUEUE_CHAT = "/user/queue/chat";
export const WS_QUEUE_NOTIFICATIONS = "/user/queue/notifications";

// ============================================
// STOMP Destination Paths (Publishing)
// ============================================
export const WS_DESTINATION_CHAT_SEND = "/app/chat.send";

// ============================================
// STOMP Protocol Versions
// ============================================
export const STOMP_VERSIONS = ["v12.stomp", "v11.stomp", "v10.stomp"];

// ============================================
// WebSocket Timing Configuration (milliseconds)
// ============================================
export const WS_RECONNECT_DELAY = 3000; // 3 seconds before reconnecting
export const WS_HEARTBEAT_INCOMING = 10000; // Server → Client heartbeat interval
export const WS_HEARTBEAT_OUTGOING = 10000; // Client → Server heartbeat interval

// ============================================
// WebSocket Flags
// ============================================
export const WS_FORCE_BINARY_FRAMES = true; // Use binary frames for efficiency
export const WS_APPEND_MISSING_NULL = true; // Auto-append NULL on incoming frames
export const WS_LOG_RAW_COMMUNICATION = __DEV__; // Enable raw STOMP frame logging in development only

