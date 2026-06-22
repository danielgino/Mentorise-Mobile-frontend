export type NotificationDto = {
    id: number;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
};

export type NotificationRawDto = {
    id: number;
    type: string;
    title: string;
    message: string;
    read?: boolean;
    isRead?: boolean;
    createdAt: string;
};

export type NotificationPageResponse = {
    content: NotificationRawDto[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
};