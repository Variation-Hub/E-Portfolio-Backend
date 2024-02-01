import * as express from 'express';
import { authorizeRoles } from '../middleware/verifyToken';
import { trimMiddleware } from '../middleware/trimMiddleware';
import ResourceController from '../controllers/ResourseController';
import { UserRole } from '../util/enum/user_enum';

const ResourceRoute = express.Router();

const Controller = new ResourceController();

ResourceRoute.post("/create", authorizeRoles(UserRole.Admin), trimMiddleware, Controller.createResource);
ResourceRoute.get("/get", Controller.getResource);
ResourceRoute.get("/list", Controller.getResources);
ResourceRoute.patch("/update/:id", trimMiddleware, Controller.updateResource);
ResourceRoute.delete("/delete/:id", Controller.deleteResource);


export default ResourceRoute;