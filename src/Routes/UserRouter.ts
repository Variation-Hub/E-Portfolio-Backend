import * as express from 'express';
import UserController from '../controllers/UserController';
import { paginationMiddleware } from '../middleware/pagination';
import { authorizeRoles } from '../middleware/verifyToken';
import { singleFileUpload } from '../util/multer';
import { trimMiddleware } from '../middleware/trimMiddleware';
import { UserRole } from '../util/enum/user_enum';

const userRoutes = express.Router();

const Controller = new UserController();

userRoutes.post("/create", authorizeRoles(UserRole.Admin), trimMiddleware, Controller.CreateUser);
userRoutes.get("/get", authorizeRoles(), Controller.GetUser);
userRoutes.patch("/update/:id", authorizeRoles(), trimMiddleware, Controller.UpdateUser);
userRoutes.post("/login", trimMiddleware, Controller.LoginUser);
userRoutes.post("/updatepassword", trimMiddleware, Controller.PasswordChangeUser);
userRoutes.delete("/delete/:id", authorizeRoles(UserRole.Admin), Controller.DeleteUser);
userRoutes.get("/list", authorizeRoles(UserRole.Admin), paginationMiddleware, Controller.GetUserList);

// avatar routes
userRoutes.post("/avatar", authorizeRoles(), singleFileUpload("avatar"), Controller.UploadAvatar)

export default userRoutes;