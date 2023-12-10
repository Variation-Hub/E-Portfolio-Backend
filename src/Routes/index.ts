import * as express from 'express';
import userRoutes from './UserRouter';
import learnerRoutes from './LearnerRouter';
import otpRoutes from './OtpRouter';

const Routes = express.Router();

Routes.use("/user", userRoutes)
Routes.use("/learner", learnerRoutes)
Routes.use("/otp", otpRoutes)

export default Routes; 