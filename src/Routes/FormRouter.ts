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
FormRoutes.delete("/delete/:id", authorizeRoles(), Controller.deleteForm);


export default FormRoutes;