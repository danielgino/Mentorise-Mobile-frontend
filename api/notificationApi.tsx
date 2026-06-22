import {apiClient} from "@/api/apiClient";
import {NotificationDto, NotificationPageResponse, NotificationRawDto} from "@/types/notification";
import {GET_MY_NOTIFICATIONS, MARK_ALL_NOTIFICATION_AS_READ, MARK_NOTIFICATION_AS_READ, GET_MY_UNREAD_COUNT} from "@/constants/apiAddress";
import { DEFAULT_NOTIFICATIONS_PAGE, DEFAULT_NOTIFICATIONS_SIZE } from "@/constants/pagination";


function normalizeNotification(raw: NotificationRawDto): NotificationDto {
    return {
        id: raw.id,
        type: raw.type,
        title: raw.title,
        message: raw.message,
        read: raw.read ?? raw.isRead ?? false,
        createdAt: raw.createdAt,
    };
}

export { normalizeNotification };

export async function getMyNotifications(page = DEFAULT_NOTIFICATIONS_PAGE, size = DEFAULT_NOTIFICATIONS_SIZE) {
    const { data } = await apiClient.get<NotificationPageResponse>(GET_MY_NOTIFICATIONS, {
        params: { page, size },
    });

    return {
        ...data,
        content: data.content.map(normalizeNotification),
    };
}

export async function getMyUnreadCount() {
    const { data } = await apiClient.get<number>(GET_MY_UNREAD_COUNT);
    return data;
}

export async function markNotificationAsRead(notificationId: number) {
    await apiClient.patch(MARK_NOTIFICATION_AS_READ(notificationId));
}

export async function markAllNotificationsAsRead() {
    await apiClient.patch(MARK_ALL_NOTIFICATION_AS_READ);
}