import * as express from 'express';
import UserController from '../controllers/UserController';
import { paginationMiddleware } from '../middleware/pagination';
import { checkRoleTokenMiddleware } from '../middleware/verifyToken';
import { singleFileUpload } from '../util/multer';


const userRoutes = express.Router();

const Controller = new UserController();

userRoutes.post("/create", singleFileUpload("avatar"), Controller.CreateUser);
userRoutes.get("/get/:id", Controller.GetUser);
userRoutes.patch("/update/:id", checkRoleTokenMiddleware, singleFileUpload("avatar"), Controller.UpdateUser);
userRoutes.post("/login", Controller.LoginUser);
userRoutes.post("/updatepassword", Controller.PasswordChangeUser);
userRoutes.delete("/delete/:id", Controller.DeleteUser);
userRoutes.get("/list", paginationMiddleware, Controller.GetUserList);

userRoutes.post("/imageupload", singleFileUpload("file"), Controller.UploadImageInAWS);
// userRoutes.post("/imageuploadmulter", upload.array('photos', 3), Controller.UploadImageMulter);

export default userRoutes;