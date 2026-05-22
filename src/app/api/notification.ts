import { getRequest } from "./client";
import { HydraCollection, Notification } from "../../utils/types";

export const getNotifications = async (token: string): Promise<Notification[]> => {
    const data = await getRequest<HydraCollection<Notification>>("/notifications", token);
    return data["hydra:member"];
};
