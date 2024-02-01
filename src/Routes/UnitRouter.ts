import * as express from 'express';
import { authorizeRoles } from '../middleware/verifyToken';
import { trimMiddleware } from '../middleware/trimMiddleware';
import UnitController from '../controllers/UnitController';
import { UserRole } from '../util/enum/user_enum';

const UnitRoute = express.Router();

const Controller = new UnitController();

UnitRoute.post("/create", authorizeRoles(UserRole.Admin), trimMiddleware, Controller.createUnit);
UnitRoute.get("/get/:id", authorizeRoles(UserRole.Learner, UserRole.EQA), Controller.getUnit);
UnitRoute.get("/list", Controller.getUnits);
UnitRoute.patch("/update/:id", trimMiddleware, Controller.updateUnit);
UnitRoute.delete("/delete/:id", Controller.deleteUnit);


export default UnitRoute;