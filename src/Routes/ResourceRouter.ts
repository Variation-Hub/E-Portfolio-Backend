import * as express from 'express';
import { checkRoleTokenMiddleware, verifyAdminTokenMiddleware, verifyTokenMiddleware } from '../middleware/verifyToken';
import { trimMiddleware } from '../middleware/trimMiddleware';
import ResourceController from '../controllers/ResourseController';

const ResourceRoute = express.Router();

const Controller = new ResourceController();

ResourceRoute.post("/create", verifyAdminTokenMiddleware, trimMiddleware, Controller.createResource);
ResourceRoute.get("/get", Controller.getResource);
ResourceRoute.get("/list", Controller.getResources);
ResourceRoute.patch("/update/:id", checkRoleTokenMiddleware, trimMiddleware, Controller.updateResource);
ResourceRoute.delete("/delete/:id", checkRoleTokenMiddleware, Controller.deleteResource);


export default ResourceRoute;