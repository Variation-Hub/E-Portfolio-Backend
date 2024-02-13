import * as express from 'express';
import { singleFileUpload } from '../util/multer';
import CourseController from '../controllers/CourseController';
import { authorizeRoles } from '../middleware/verifyToken';
import { paginationMiddleware } from '../middleware/pagination';

const CourseRoutes = express.Router();

const Controller = new CourseController();

CourseRoutes.post("/convert", singleFileUpload("pdf"), Controller.GenerateCourse);
CourseRoutes.post("/create", Controller.CreateCourse);
CourseRoutes.delete('/delete/:id', Controller.DeleteCourse);
CourseRoutes.patch('/update/:id', Controller.updateCourse);
CourseRoutes.post('/add-learner', authorizeRoles(), Controller.addLearnerToCourse);
CourseRoutes.post('/add-trainer', authorizeRoles(), Controller.addTrainerToCourse);
CourseRoutes.get('/get/:id', authorizeRoles(), Controller.getCourse);
CourseRoutes.get('/list', paginationMiddleware, Controller.getAllCourse);

export default CourseRoutes;