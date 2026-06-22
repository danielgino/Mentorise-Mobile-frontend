import {getOrCreateConversation} from "@/api/chatApi";

// ============================================
// AUTHENTICATION
// ============================================
export const LOGIN_REQUEST = "/api/users/auth/login"
export const REGISTER_REQUEST = "/api/users/auth/register"
export const LOGOUT_REQUEST = "/api/users/auth/logout"
export const FORGOT_PASSWORD_REQUEST = "/api/users/auth/forgot-password"
export const RESET_PASSWORD_REQUEST = "/api/users/auth/reset-password"

// ============================================
// CHAT
// ============================================
export const GET_CONVERSATION = (otherUserId: number) => `/chat/conversations/with/${otherUserId}`;
export const GET_MESSAGES = (conversationId: number) => `/chat/conversations/${conversationId}/messages`;
export const SEND_MESSAGE = (conversationId: number) => `/chat/conversations/${conversationId}/messages`;
export const MARK_AS_READ_MESSAGES = (conversationId: number) => `/chat/conversations/${conversationId}/read`;
export const GET_INBOX_LIST = "/chat/conversations"

// ============================================
// USER / PROFILE
// ============================================
export const GET_ME = "/api/users/me"
export const UPDATE_MY_PHONE = "/api/users/me/phone"
export const UPDATE_MY_PROFILE_IMAGE = "/api/users/me/profile-image"
export const DELETE_MY_PROFILE_IMAGE = "/api/users/me/profile-image"

// ============================================
// TUTOR PROFILE
// ============================================
export const UPDATE_TUTOR_PROFILE = "/api/tutors/me/profile"
export const GET_TUTOR_PROFILE = (userId: number) => `/api/tutors/${userId}/profile`;
export const CREATE_TUTOR_APPLICATION = "/api/tutors"
export const GET_MY_PENDING_APPLICATION = "/api/tutors/me/application/pending"
export const GET_MY_TUTOR_SCOPES = "/api/tutors/me/scopes"
export const SWIPE_API = "/api/tutors/swipe"

// ============================================
// COURSES
// ============================================
export const GET_MY_COURSES = "/api/courses/my-courses"

// ============================================
// LEARNING PREFERENCES
// ============================================
export const INSERT_LEARNING_PREFERENCES = "/api/users/learning-preferences"
export const GET_LEARNING_PREFERENCES = "/api/users/me/learning-preferences"

// ============================================
// MAJORS
// ============================================
export const GET_ALL_MAJORS = "/api/users/major/get-all"

// ============================================
// SESSION OFFERS
// ============================================
export const CREATE_SESSION_OFFER = "/api/users/session-offers"
export const GET_PENDING_SESSION_OFFERS = "/api/users/session-offers/pending"
export const GET_UPCOMING_SESSION_OFFERS = "/api/users/session-offers/upcoming"
export const GET_COMPLETED_SESSION_OFFERS = "/api/users/session-offers/completed"
export const DECLINE_SESSION_OFFER = (offerId: number) => `/api/users/session-offers/${offerId}/decline`

// ============================================
// PAYMENTS
// ============================================
export const CREATE_MOCK_CHECKOUT = "/api/users/payments/mock/checkout"
export const CONFIRM_MOCK_PAYMENT = "/api/users/payments/mock/confirm"

// ============================================
// NOTIFICATIONS
// ============================================
export const GET_MY_NOTIFICATIONS = "/notifications/my"
export const GET_MY_UNREAD_COUNT = "/notifications/my/unread-count"
export const MARK_NOTIFICATION_AS_READ = (notificationId: number) => `/notifications/${notificationId}/read`;
export const MARK_ALL_NOTIFICATION_AS_READ = "/notifications/my/read-all";

// ============================================
// EARNINGS (TUTOR)
// ============================================
export const GET_TUTOR_CURRENT_CYCLE = "/api/tutors/me/payments/current-cycle";
export const GET_TUTOR_PAYMENT_CYCLES = "/api/tutors/me/payments/cycles";
export const GET_TUTOR_CYCLE_LESSONS = (cycleId: number) =>
    `/api/tutors/me/payments/cycles/${cycleId}/lessons`;