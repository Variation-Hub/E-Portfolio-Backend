import { AppDataSource } from "../../data-source";
import { Notification } from "../../entity/Notification.entity";
import { sendMessageToUser } from "../../socket/socketEvent";

export const SendNotification = async (user_id, data) => {
    try {
        const Repository = AppDataSource.getRepository(Notification);

        sendMessageToUser(user_id, data)
        const resource = Repository.create({
            user_id,
            title: data.title,
            message: data.message
        })

        const savedResource = await Repository.save(resource);
        return savedResource
    } catch (err) {
        console.log(err);
    }
}