import * as express from 'express';
import { authorizeRoles } from '../middleware/verifyToken';
import ForumController from '../controllers/ForumController';
import { paginationMiddleware } from '../middleware/pagination';

const forumRoutes = express.Router();

const Controller = new ForumController();

forumRoutes.post("/send", authorizeRoles(), Controller.sendMessage);
forumRoutes.patch("/update/:id", authorizeRoles(), Controller.updateMessage);
forumRoutes.get("/messages/:course_id", authorizeRoles(), paginationMiddleware, Controller.getMessages);
forumRoutes.delete("/delete/:id", authorizeRoles(), Controller.deleteForum);

export default forumRoutes;