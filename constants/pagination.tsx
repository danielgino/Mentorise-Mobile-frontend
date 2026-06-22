/**
 * API Pagination & Default Limits Configuration
 * Centralized default values for pagination across the application
 */

// ============================================
// Chat Pagination Defaults
// ============================================
/**
 * Default number of conversations to fetch per request
 * Used in: chatApi.getInbox()
 */
export const DEFAULT_INBOX_LIMIT = 30;

/**
 * Default number of messages to fetch per request
 * Used in: chatApi.getMessages()
 */
export const DEFAULT_MESSAGES_LIMIT = 30;

// ============================================
// Tutor Swipe Pagination Defaults
// ============================================
/**
 * Default number of tutors to fetch per swipe request
 * Used in: tutorsSwipeApi.getSwipeTutors()
 */
export const DEFAULT_SWIPE_LIMIT = 10;

// ============================================
// Notifications Pagination Defaults
// ============================================
/**
 * Default page number for notifications
 * Used in: notificationApi.getMyNotifications()
 */
export const DEFAULT_NOTIFICATIONS_PAGE = 0;

/**
 * Default page size for notifications
 * Used in: notificationApi.getMyNotifications()
 */
export const DEFAULT_NOTIFICATIONS_SIZE = 20;

