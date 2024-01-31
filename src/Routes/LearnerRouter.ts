import * as express from 'express';
import LearnerController from '../controllers/LearnerController';
import { verifyAdminTokenMiddleware } from '../middleware/verifyToken';
import { singleFileUpload } from '../util/multer';

const learnerRoutes = express.Router();

const Controller = new LearnerController();

learnerRoutes.post("/create", verifyAdminTokenMiddleware, singleFileUpload("avatar"), Controller.CreateLearner);
learnerRoutes.get("/get/:id", Controller.getLearner);
learnerRoutes.patch("/update/:id", verifyAdminTokenMiddleware, Controller.updateLearner);
learnerRoutes.delete("/delete/:id", verifyAdminTokenMiddleware, Controller.deleteLearner);

export default learnerRoutes;