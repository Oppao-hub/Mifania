import { deleteRequest, getRequest, postRequest } from "./client";
import { Notification } from "../../utils/types";

export const getNotifications = async (token: string): Promise<Notification[]> => {
    const data = await getRequest<any>("/notifications", token);
    
    return data.notifications || data["hydra:member"] || [];
};

export const deleteNotification = async (id: number, token: string): Promise<void> => {
    await deleteRequest(`/notifications/${id}`, token);
};

export const clearNotifications = async (token: string): Promise<void> => {
    await deleteRequest('/notifications/clear', token);
};

export const markNotificationRead = async (id: number, token: string): Promise<void> => {
    await postRequest(`/notifications/${id}/read`, {}, token);
};