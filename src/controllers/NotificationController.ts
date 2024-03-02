import { Response } from "express";
import { CustomRequest } from "../util/Interface/expressInterface";
import { connectUser } from "../socket/socketEvent";

class NotificationController {

    public async connectUser(req: CustomRequest, res: Response) {
        try {
            const userId = req.user.user_id;
            console.log(userId);

            connectUser(userId);
            res.status(200).json({
                message: 'User connected to socket',
                status: true,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error.message,
                status: false,
            });
        }
    }
}

export default NotificationController;