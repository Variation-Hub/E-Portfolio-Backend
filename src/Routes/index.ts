import * as express from 'express';
import userRoutes from './UserRouter';
import learnerRoutes from './LearnerRouter';
import otpRoutes from './OtpRouter';
// import UnitRoute from './UnitRouter';
import ResourceRoute from './ResourceRouter';
import CourseRoutes from './CourseRouter';
import ResourceStatusRoute from './ResourceStatusRouter';
import NotificationRoutes from './NotificationRouter';
import AssignmentRoutes from './AssignmentRouter';
import EmployerRoutes from './EmployerRouter';
import cpdRoutes from './CpdRouter';
import FileController from '../controllers/FileController';
import { multipleFileUpload, singleFileUpload } from '../util/multer';
import { authorizeRoles } from '../middleware/verifyToken';
import supportRoutes from './SupportRouter';
import sessionRoutes from './SessionRouter';

const fileController = new FileController;
const Routes = express.Router();

Routes.use("/user", userRoutes)
Routes.use("/learner", learnerRoutes)
Routes.use("/otp", otpRoutes)
Routes.use("/resource", ResourceRoute)
Routes.use("/course", CourseRoutes)
Routes.use("/resource-status", ResourceStatusRoute)
Routes.use("/notification", NotificationRoutes)
Routes.use("/assignment", AssignmentRoutes)
Routes.use("/employer", EmployerRoutes)
Routes.use("/cpd", cpdRoutes)
Routes.use("/support", supportRoutes)
Routes.use("/session", sessionRoutes)

// API routes
Routes.post("/upload/file", authorizeRoles(), singleFileUpload('file'), fileController.uploadSingleFile)
Routes.post("/upload/files", authorizeRoles(), multipleFileUpload('files', 5), fileController.uploadMultipleFile)

export default Routes; 