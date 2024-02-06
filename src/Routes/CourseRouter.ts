import * as express from 'express';
import LearnerController from '../controllers/LearnerController';
import { singleFileUpload } from '../util/multer';
import CourseController from '../controllers/CourseController';

const CourseRoutes = express.Router();

const Controller = new CourseController();

CourseRoutes.post("/convert", singleFileUpload("pdf"), Controller.GenerateCourse);
CourseRoutes.post("/create", Controller.CreateCourse);
CourseRoutes.delete('/delete/:id', Controller.DeleteCourse);

export default CourseRoutes;