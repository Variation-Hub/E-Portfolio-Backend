import * as express from 'express';
import LearnerController from '../controllers/LearnerController';
import { singleFileUpload } from '../util/multer';
import CourseController from '../controllers/CourseController';

const CourseRoutes = express.Router();

const Controller = new CourseController();

CourseRoutes.post("/convert", singleFileUpload("pdf"), Controller.GenerateCourse);


export default CourseRoutes;