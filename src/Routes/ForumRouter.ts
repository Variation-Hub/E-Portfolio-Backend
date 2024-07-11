import * as express from 'express';
import { authorizeRoles } from '../middleware/verifyToken';
import ForumController from '../controllers/ForumController';

const forumRoutes = express.Router();

const Controller = new ForumController();

forumRoutes.post("/send", authorizeRoles(), Controller.sendMessage);
// forumRoutes.get("/get", authorizeRoles(), Controller.GetUser);
// forumRoutes.patch("/update/:id", authorizeRoles(), trimMiddleware, Controller.UpdateUser);
// forumRoutes.delete("/delete/:id", authorizeRoles(UserRole.Admin), Controller.DeleteUser);

export default forumRoutes;