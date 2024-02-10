import * as express from 'express';
import { authorizeRoles } from '../middleware/verifyToken';
import { trimMiddleware } from '../middleware/trimMiddleware';
import UnitController from '../controllers/UnitController';
import { UserRole } from '../util/enum/user_enum';
import ResourceStatusController from '../controllers/ResourseStatusController';

const ResourceStatusRoute = express.Router();

const Controller = new ResourceStatusController();

ResourceStatusRoute.post("/create", authorizeRoles(UserRole.Admin), trimMiddleware, Controller.addResourceStatus);



export default ResourceStatusRoute;