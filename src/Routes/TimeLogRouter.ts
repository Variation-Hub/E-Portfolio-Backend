import * as express from 'express';
import { authorizeRoles } from '../middleware/verifyToken';
import { paginationMiddleware } from '../middleware/pagination';
import TimeLogController from '../controllers/TimeLogController';

const TimeLogRoutes = express.Router();

const Controller = new TimeLogController();

TimeLogRoutes.post('/create', authorizeRoles(), Controller.createTimeLog);
TimeLogRoutes.get('/get/:id', authorizeRoles(), Controller.getTimeLog);
TimeLogRoutes.get('/list', authorizeRoles(), paginationMiddleware, Controller.getTimeLogs);
TimeLogRoutes.patch('/update/:id', authorizeRoles(), Controller.updateTimeLog);
TimeLogRoutes.delete('/delete/:id', authorizeRoles(), Controller.deleteTimeLog);


export default TimeLogRoutes;