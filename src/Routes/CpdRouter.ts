import * as express from 'express';
import CpdController from '../controllers/CpdController';
import { authorizeRoles } from '../middleware/verifyToken';

const cpdRoutes = express.Router();

const Controller = new CpdController();

cpdRoutes.post("/create", authorizeRoles(), Controller.createCpd);
cpdRoutes.patch("/update", authorizeRoles(), Controller.updateCpd);
cpdRoutes.get("/get/:user_id", authorizeRoles(), Controller.getCpd);

export default cpdRoutes;