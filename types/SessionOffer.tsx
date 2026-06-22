export type SessionOfferStatus =
    | "PENDING"
    | "PENDING_PAYMENT"
    | "ACCEPTED"
    | "DECLINED"
    | "EXPIRED";

export type SessionOfferDto = {
    id: number;
    tutorUserId: number;
    studentUserId: number;
    startTime: string;
    endTime: string;
    price: number;
    note?: string | null;
    status: SessionOfferStatus;
    expiresAt?: string | null;
    createdAt: string;
    updatedAt: string;
};
export type CreateSessionOfferRequest = {
    studentUserId: number;
    startTime: string;
    endTime: string;
    price: number;
    note?: string;
};