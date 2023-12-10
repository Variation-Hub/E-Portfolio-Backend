import * as express from 'express';
import LearnerController from '../controllers/LearnerContaroller';
import { verifyAdminTokenMiddleware } from '../middleware/verifyToken';
import { singleFileUpload } from '../util/multer';

const learnerRoutes = express.Router();

const Controller = new LearnerController();

learnerRoutes.post("/create", verifyAdminTokenMiddleware, singleFileUpload("avatar"), Controller.CreateLearner);

export default learnerRoutes;