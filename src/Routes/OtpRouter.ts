import * as express from 'express';
import OtpController from '../controllers/OtpController';
import { verifyTokenMiddleware } from '../middleware/verifyToken';

const otpRoutes = express.Router();

const Controller = new OtpController();

otpRoutes.post("/sendotp", Controller.sendOTP);
otpRoutes.post("/validateotp", Controller.validateOTP);

export default otpRoutes;