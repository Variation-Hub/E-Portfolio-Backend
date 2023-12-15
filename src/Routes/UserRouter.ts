import * as express from 'express';
import UserController from '../controllers/UserController';
import { paginationMiddleware } from '../middleware/pagination';
import { checkRoleTokenMiddleware, verifyTokenMiddleware } from '../middleware/verifyToken';
import { singleFileUpload } from '../util/multer';

const userRoutes = express.Router();

const Controller = new UserController();

userRoutes.post("/create", verifyTokenMiddleware, singleFileUpload("avatar"), Controller.CreateUser);
userRoutes.get("/get/:id", verifyTokenMiddleware, Controller.GetUser);
userRoutes.patch("/update/:id", verifyTokenMiddleware, checkRoleTokenMiddleware, singleFileUpload("avatar"), Controller.UpdateUser);
userRoutes.post("/login", Controller.LoginUser);
userRoutes.post("/updatepassword", verifyTokenMiddleware, Controller.PasswordChangeUser);
userRoutes.delete("/delete/:id", verifyTokenMiddleware, Controller.DeleteUser);
userRoutes.get("/list", verifyTokenMiddleware, paginationMiddleware, Controller.GetUserList);
export default userRoutes;