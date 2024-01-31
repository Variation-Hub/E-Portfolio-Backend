import * as express from 'express';
import userRoutes from './UserRouter';
import learnerRoutes from './LearnerRouter';
import otpRoutes from './OtpRouter';
import UnitRoute from './UnitRouter';
import ResourceRoute from './ResourceRouter';
import CourseRoutes from './CourseRouter';

const Routes = express.Router();

Routes.use("/user", userRoutes)
Routes.use("/learner", learnerRoutes)
Routes.use("/otp", otpRoutes)
Routes.use("/unit", UnitRoute)
Routes.use("/resource", ResourceRoute)
Routes.use("/course", CourseRoutes)

export default Routes; 