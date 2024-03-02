import * as express from 'express';
import NotificationController from '../controllers/NotificationController';
import { authorizeRoles } from '../middleware/verifyToken';

const NotificationRoutes = express.Router();

const Controller = new NotificationController();

NotificationRoutes.post("/connect", authorizeRoles(), Controller.connectUser);

export default NotificationRoutes;