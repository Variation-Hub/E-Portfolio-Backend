import * as express from 'express';
import UserController from '../controllers/UserController';
import { paginationMiddleware } from '../middleware/pagination';
import { authorizeRoles } from '../middleware/verifyToken';
import { singleFileUpload } from '../util/multer';
import { trimMiddleware } from '../middleware/trimMiddleware';
import { UserRole } from '../util/constants';

const userRoutes = express.Router();

const Controller = new UserController();

userRoutes.post("/create", trimMiddleware, Controller.CreateUser);
userRoutes.get("/get", authorizeRoles(), Controller.GetUser);
userRoutes.patch("/update/:id", authorizeRoles(), trimMiddleware, Controller.UpdateUser);
userRoutes.post("/login", trimMiddleware, Controller.LoginUser);
userRoutes.post("/updatepassword", trimMiddleware, Controller.UpdatePassword);
userRoutes.post("/password/change", authorizeRoles(), trimMiddleware, Controller.ChangePassword);
userRoutes.delete("/delete/:id", authorizeRoles(UserRole.Admin), Controller.DeleteUser);
userRoutes.get("/list", authorizeRoles(), paginationMiddleware, Controller.GetUserList);
userRoutes.post("/changerole", authorizeRoles(), Controller.ChangeUserRole);

// avatar routes
userRoutes.post("/avatar", authorizeRoles(), singleFileUpload("avatar"), Controller.UploadAvatar)

export default userRoutes;