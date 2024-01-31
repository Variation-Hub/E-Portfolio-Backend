import * as express from 'express';
import { checkRoleTokenMiddleware, verifyAdminTokenMiddleware, verifyTokenMiddleware } from '../middleware/verifyToken';
import { trimMiddleware } from '../middleware/trimMiddleware';
import UnitController from '../controllers/UnitController';

const UnitRoute = express.Router();

const Controller = new UnitController();

UnitRoute.post("/create", verifyAdminTokenMiddleware, trimMiddleware, Controller.createUnit);
UnitRoute.get("/get", Controller.getUnit);
UnitRoute.get("/list", Controller.getUnits);
UnitRoute.patch("/update/:id", checkRoleTokenMiddleware, trimMiddleware, Controller.updateUnit);
UnitRoute.delete("/delete/:id", checkRoleTokenMiddleware, Controller.deleteUnit);


export default UnitRoute;