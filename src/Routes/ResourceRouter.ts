import * as express from 'express';
import { authorizeRoles } from '../middleware/verifyToken';
import { trimMiddleware } from '../middleware/trimMiddleware';
import ResourceController from '../controllers/ResourseController';
import { UserRole } from '../util/enum/user_enum';
import { singleFileUpload } from '../util/multer';
import { paginationMiddleware } from '../middleware/pagination';

const ResourceRoute = express.Router();

const Controller = new ResourceController();

ResourceRoute.post("/create", authorizeRoles(UserRole.Admin, UserRole.Trainer), trimMiddleware, singleFileUpload("file"), Controller.createResource);
ResourceRoute.get("/get/:id", Controller.getResource);
ResourceRoute.get("/list", paginationMiddleware, Controller.getResources);
ResourceRoute.patch("/update/:id", trimMiddleware, Controller.updateResource);
ResourceRoute.delete("/delete/:id", Controller.deleteResource);
ResourceRoute.get("/list-by-unit", authorizeRoles(UserRole.Admin,UserRole.EQA, UserRole.Employer, UserRole.IQA, UserRole.Learner, UserRole.Trainer ),Controller.getUnitResources);


export default ResourceRoute;