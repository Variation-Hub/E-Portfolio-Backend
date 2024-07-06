import * as express from 'express';
import { authorizeRoles } from '../middleware/verifyToken';
import FormController from '../controllers/FormController';
import { paginationMiddleware } from '../middleware/pagination';

const FormRoutes = express.Router();

const Controller = new FormController();

FormRoutes.post('/create', authorizeRoles(), Controller.CreateForm);
FormRoutes.get("/get/:id", authorizeRoles(), Controller.getForm);
FormRoutes.get("/list", authorizeRoles(), paginationMiddleware, Controller.getForms);
FormRoutes.patch("/update/:id", authorizeRoles(), Controller.updateForm);
FormRoutes.patch("/add-user/:id", authorizeRoles(), Controller.addUsersToForm);
FormRoutes.delete("/delete/:id", authorizeRoles(), Controller.deleteForm);

// UserForm routes
FormRoutes.post('/user/create', authorizeRoles(), Controller.createUserFormData);
FormRoutes.get("/user/:id", authorizeRoles(), Controller.getUserFormData);

export default FormRoutes;