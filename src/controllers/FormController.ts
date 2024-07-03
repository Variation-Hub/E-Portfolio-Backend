import { Response } from "express";
import { AppDataSource } from "../data-source";
import { CustomRequest } from "../util/Interface/expressInterface";
import { Form } from "../entity/Form.entity";
import { UserRole } from "../util/constants";

class FormController {

    public async CreateForm(req: CustomRequest, res: Response) {
        try {
            const { form_name, description, form_data, type } = req.body;

            const formRepository = AppDataSource.getRepository(Form);
            let data = {
                form_name,
                description,
                form_data,
                type,
                user_id: req.user.user_id,
            }

            if (req.user.role === UserRole.Admin) {
                data['admin_Form'] = true;
            }

            const form = formRepository.create(data)

            const savedForm = await formRepository.save(form);
            res.status(200).json({
                message: "Form created successfully",
                status: true,
                data: savedForm,
            });

        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error.message,
                status: false,
            });
        }
    }

    public async updateForm(req: CustomRequest, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const { form_name, description, form_data, type } = req.body;
            if (!form_name && !description && !form_data && !type) {
                return res.status(400).json({
                    message: 'At least one field required',
                    status: false,
                });
            }

            const formRepository = AppDataSource.getRepository(Form);

            const form = await formRepository.findOne({ where: { id } });

            if (!form) {
                return res.status(404).json({
                    message: 'Form not found',
                    status: false,
                });
            }

            form.form_name = form_name || form.form_name;
            form.form_data = form_data || form.form_data;
            form.description = description || form.description;
            form.type = type || form.type;

            const updatedForm = await formRepository.save(form);

            return res.status(200).json({
                message: 'Form updated successfully',
                status: true,
                data: updatedForm,
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error',
                status: false,
                error: error.message,
            });
        }
    }

    public async getForm(req: CustomRequest, res: Response) {
        try {
            const id = parseInt(req.params.id);

            const formRepository = AppDataSource.getRepository(Form);

            const form = await formRepository.createQueryBuilder('form')
                .leftJoinAndSelect('form.user_id', 'user')
                .where('form.id = :id', { id })
                .select(['form', 'user.user_id', 'user.email', 'user.user_name'])
                .getOne();


            if (!form) {
                return res.status(404).json({
                    message: 'Form not found',
                    status: false,
                });
            }

            return res.status(200).json({
                message: 'Form retrieved successfully',
                status: true,
                data: form,
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error',
                status: false,
                error: error.message,
            });
        }
    }

    public async getForms(req: CustomRequest, res: Response) {
        try {

            const formRepository = AppDataSource.getRepository(Form);

            const [forms, count] = await formRepository.createQueryBuilder('form')
                .leftJoinAndSelect('form.user_id', 'user')
                .where(req.user.role !== UserRole.Admin ? 'form.admin_Form = :admin_Form' : '1=1', { admin_Form: false })
                .andWhere(req.user.role !== UserRole.Admin ? 'user.user_id = :user_id' : '1=1', { user_id: req.user.user_id })
                .select(['form', 'user.user_id', 'user.email', 'user.user_name'])
                .orderBy(`form.${(req.user.role === UserRole.Admin) ? 'id' : 'created_at'}`, `${(req.user.role === UserRole.Admin) ? 'ASC' : 'DESC'}`)
                .skip(Number(req.pagination.skip))
                .take(Number(req.pagination.limit))
                .getManyAndCount();

            return res.status(200).json({
                message: 'Form retrieved successfully',
                status: true,
                data: forms,
                ...(req.query.meta === "true" && {
                    meta_data: {
                        page: req.pagination.page,
                        items: count,
                        page_size: req.pagination.limit,
                        pages: Math.ceil(count / req.pagination.limit)
                    }
                })
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error',
                status: false,
                error: error.message,
            });
        }
    }

    public async deleteForm(req: CustomRequest, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const formRepository = AppDataSource.getRepository(Form);

            const deleteResult = await formRepository.delete(id);

            if (deleteResult.affected === 0) {
                return res.status(404).json({
                    message: 'Form not found',
                    status: false,
                });
            }

            return res.status(200).json({
                message: 'Form deleted successfully',
                status: true,
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error',
                status: false,
                error: error.message,
            });
        }
    }

}

export default FormController;