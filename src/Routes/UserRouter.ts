import * as express from 'express';
import UserController from '../controllers/UserController';
import { paginationMiddleware } from '../middleware/pagination';
import { checkRoleTokenMiddleware, verifyAdminTokenMiddleware, verifyTokenMiddleware } from '../middleware/verifyToken';
import { singleFileUpload } from '../util/multer';
import { trimMiddleware } from '../middleware/trimMiddleware';

const userRoutes = express.Router();

const Controller = new UserController();

userRoutes.post("/create", verifyAdminTokenMiddleware, trimMiddleware, Controller.CreateUser);
userRoutes.get("/get", verifyTokenMiddleware, Controller.GetUser);
userRoutes.patch("/update/:id", checkRoleTokenMiddleware, trimMiddleware, Controller.UpdateUser);
userRoutes.post("/login", trimMiddleware, Controller.LoginUser);
userRoutes.post("/updatepassword", trimMiddleware, Controller.PasswordChangeUser);
userRoutes.delete("/delete/:id", verifyAdminTokenMiddleware, Controller.DeleteUser);
userRoutes.get("/list", verifyAdminTokenMiddleware, paginationMiddleware, Controller.GetUserList);

// avatar routes
userRoutes.post("/avatar", verifyTokenMiddleware, singleFileUpload("avatar"), Controller.UploadAvatar)

export default userRoutes;