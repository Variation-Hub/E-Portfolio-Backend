import * as express from 'express';
import { authorizeRoles } from '../middleware/verifyToken';
import { trimMiddleware } from '../middleware/trimMiddleware';
import ResourceController from '../controllers/ResourseController';
import { UserRole } from '../util/enum/user_enum';
import { singleFileUpload } from '../util/multer';

const ResourceRoute = express.Router();

const Controller = new ResourceController();

ResourceRoute.post("/create", authorizeRoles(UserRole.Admin), trimMiddleware, singleFileUpload("file"), Controller.createResource);
ResourceRoute.get("/get/:id", Controller.getResource);
ResourceRoute.get("/list", Controller.getResources);
ResourceRoute.patch("/update/:id", trimMiddleware, Controller.updateResource);
ResourceRoute.delete("/delete/:id", Controller.deleteResource);
ResourceRoute.get("/list/:id", authorizeRoles(UserRole.Admin,UserRole.EQA, UserRole.Employer, UserRole.IQA, UserRole.Learner, UserRole.Trainer ),Controller.getUnitResources);


export default ResourceRoute;