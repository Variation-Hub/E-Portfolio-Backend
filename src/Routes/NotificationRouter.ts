import * as express from 'express';
import NotificationController from '../controllers/NotificationController';
import { authorizeRoles } from '../middleware/verifyToken';

const NotificationRoutes = express.Router();

const Controller = new NotificationController();

NotificationRoutes.post("/connect", authorizeRoles(), Controller.connectUser);
NotificationRoutes.get("/list", authorizeRoles(), Controller.getNotificationForUser);
NotificationRoutes.delete("/delete/:id", authorizeRoles(), Controller.deleteSingleNotification);
NotificationRoutes.delete("/delete", authorizeRoles(), Controller.deletemultipleNotification);

export default NotificationRoutes;