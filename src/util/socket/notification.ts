import { AppDataSource } from "../../data-source";
import { Notification } from "../../entity/Notification.entity";
import { sendDataToUser } from "../../socket/socket";


export const SendNotification = async (user_id, data) => {
    try {
        const notificationRepository = AppDataSource.getRepository(Notification);

        sendDataToUser([user_id], data)
        const resource = notificationRepository.create({
            user_id,
            title: data.data.title,
            message: data.data.message
        })

        const savedResource = await notificationRepository.save(resource);
        return savedResource
    } catch (err) {
        console.log(err);
    }
}