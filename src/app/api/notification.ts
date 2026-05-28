import { getRequest } from "./client";
import { Notification } from "../../utils/types";

export const getNotifications = async (token: string): Promise<Notification[]> => {
    const data = await getRequest<any>("/notifications", token);
    
    return data.notifications || data["hydra:member"] || [];
};