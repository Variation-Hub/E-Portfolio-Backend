import { AppDataSource } from "../../data-source";
import { Notification } from "../../entity/Notification.entity";
import { sendDataToUser } from "../../socket/socket";
import { SocketEvents } from "../constants";


export const SendNotification = async (user_id, data) => {
    try {
        const notificationRepository = AppDataSource.getRepository(Notification);

        sendDataToUser(SocketEvents.Notification, [user_id], data)
        const resource = notificationRepository.create({
            user_id,
            title: data.title,
            message: data.message
        })

        const savedResource = await notificationRepository.save(resource);
        return savedResource
    } catch (err) {
        console.log(err);
    }
}