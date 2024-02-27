import * as express from 'express';
import LearnerController from '../controllers/LearnerController';
import { authorizeRoles } from '../middleware/verifyToken';
import { singleFileUpload } from '../util/multer';
import { UserRole } from '../util/enum/user_enum';
import { paginationMiddleware } from '../middleware/pagination';

const learnerRoutes = express.Router();

const Controller = new LearnerController();

learnerRoutes.post("/create", authorizeRoles(UserRole.Admin), singleFileUpload("avatar"), Controller.CreateLearner);
learnerRoutes.get("/list", authorizeRoles(), paginationMiddleware, Controller.getLearnerList);
learnerRoutes.get("/get/:id", authorizeRoles(), Controller.getLearner);
learnerRoutes.get("/get", authorizeRoles(UserRole.Learner), Controller.getLearnerByToken);
learnerRoutes.patch("/update/:id", authorizeRoles(UserRole.Admin), Controller.updateLearner);
learnerRoutes.delete("/delete/:id", authorizeRoles(UserRole.Admin), Controller.deleteLearner);

export default learnerRoutes;