import { apiClient } from "@/api/apiClient";
import {
    CREATE_SESSION_OFFER,
    GET_PENDING_SESSION_OFFERS,
    GET_UPCOMING_SESSION_OFFERS,
    GET_COMPLETED_SESSION_OFFERS,
    DECLINE_SESSION_OFFER,
    CREATE_MOCK_CHECKOUT,
    CONFIRM_MOCK_PAYMENT,
} from "@/constants/apiAddress";

export type CreateSessionOfferRequest = {
    studentUserId: number;
    startTime: string;
    endTime: string;
    note?: string;
};

export type SessionOfferStatus =
    | "PENDING"
    | "PENDING_PAYMENT"
    | "ACCEPTED"
    | "DECLINED"
    | "EXPIRED";

export type SessionOfferCardDto = {
    id: number;
    tutorUserId: number;
    studentUserId: number;
    tutorFullName: string;
    tutorProfileImageUrl?: string | null;
    studentFullName: string;
    studentProfileImageUrl?: string | null;
    startTime: string;
    endTime: string;
    price: number;
    note?: string | null;
    status: SessionOfferStatus;
    expiresAt?: string | null;
};

export type CreateMockCheckoutRequest = {
    sessionOfferId: number;
};

export type ConfirmMockPaymentRequest = {
    checkoutSessionId: string;
    cardNumber: string;
    cardHolderName: string;
    expiry: string;
    cvv: string;
};

export type PaymentResponse = {
    paymentId: number;
    checkoutSessionId: string;
    status: "CREATED" | "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "EXPIRED";
    amount: number;
    transactionRef?: string | null;
    cardBrand?: string | null;
    cardLast4?: string | null;
    message: string;
};

export const createSessionOffer = async (payload: CreateSessionOfferRequest) => {
    const response = await apiClient.post(CREATE_SESSION_OFFER, payload);
    return response.data;
};

export const getPendingSessionOffers = async (): Promise<SessionOfferCardDto[]> => {
    const response = await apiClient.get(GET_PENDING_SESSION_OFFERS);
    return response.data;
};

export const getUpcomingSessionOffers = async (): Promise<SessionOfferCardDto[]> => {
    const response = await apiClient.get(GET_UPCOMING_SESSION_OFFERS);
    return response.data;
};

export const getCompletedSessionOffers = async (): Promise<SessionOfferCardDto[]> => {
    const response = await apiClient.get(GET_COMPLETED_SESSION_OFFERS);
    return response.data;
};

export const declineSessionOffer = async (offerId: number) => {
    await apiClient.post(DECLINE_SESSION_OFFER(offerId));
};

export const createMockCheckout = async (
    payload: CreateMockCheckoutRequest
): Promise<PaymentResponse> => {
    const response = await apiClient.post(CREATE_MOCK_CHECKOUT, payload);
    return response.data;
};

export const confirmMockPayment = async (
    payload: ConfirmMockPaymentRequest
): Promise<PaymentResponse> => {
    const response = await apiClient.post(CONFIRM_MOCK_PAYMENT, payload);
    return response.data;
};