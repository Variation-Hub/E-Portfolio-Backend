import { Response } from "express";
import { AppDataSource } from "../data-source";
import { CustomRequest } from "../util/Interface/expressInterface";
import { Form } from "../entity/Form.entity";
import { UserRole } from "../util/constants";
import { User } from "../entity/User.entity";
import { UserForm } from "../entity/UserForm.entity";

class FormController {

    public async CreateForm(req: CustomRequest, res: Response) {
        try {
            const { form_name, description, form_data, type } = req.body;

            const formRepository = AppDataSource.getRepository(Form);
            let data = {
                form_name,
                description,
                form_data,
                type
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
                .where('form.id = :id', { id })
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
            const qb = formRepository.createQueryBuilder('form')

            if (req.query.keyword) {
                qb.andWhere("(form.form_name ILIKE :keyword)", { keyword: `%${req.query.keyword}%` });
            }
            if (req.user.role !== UserRole.Admin) {
                qb.innerJoin('form.users', 'user', 'user.user_id = :user_id', { user_id: req.user.user_id })
            }

            const [forms, count] = await qb
                .skip(Number(req.pagination.skip))
                .take(Number(req.pagination.limit))
                .orderBy(`form.id`, `ASC`)
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

    public async addUsersToForm(req: CustomRequest, res: Response) {
        const formRepository = AppDataSource.getRepository(Form);
        const userRepository = AppDataSource.getRepository(User);
        const form_id = parseInt(req.params.id);
        const { user_ids } = req.body;

        try {
            const form = await formRepository.findOne({ where: { id: form_id }, relations: ['users'] });

            if (!form) {
                return res.status(404).json({
                    message: 'Form not found',
                    status: false
                });
            }

            const usersToAdd = await userRepository.findByIds(user_ids);

            if (!usersToAdd.length) {
                return res.status(404).json({
                    message: 'Users not found',
                    status: false,
                });
            }

            const usersToAddFiltered = usersToAdd.filter(user => !form.users.some(existingUser => existingUser.user_id === user.user_id));

            form.users = [...(form?.users || []), ...usersToAddFiltered];

            await formRepository.save(form);

            return res.status(200).json({
                message: 'Users added to form successfully',
                status: true,
                form
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error',
                status: false,
                error: error.message,
            });
        }
    }

    public async createUserFormData(req: CustomRequest, res: Response) {
        try {
            const userFormRepository = AppDataSource.getRepository(UserForm);
            const { form_id, form_data } = req.body;
            let form = await userFormRepository.findOne({ where: { user: { user_id: req.user.user_id }, form: { id: form_id } } });

            if (form) {
                form.form_data = form_data;
            } else {
                form = userFormRepository.create({
                    user: req.user.user_id,
                    form: form_id,
                    form_data
                })
            }

            await userFormRepository.save(form);

            return res.status(200).json({
                message: 'User form data saved successfully',
                status: true
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error',
                status: false,
                error: error.message,
            });
        }
    }

    public async getUserFormData(req: CustomRequest, res: Response) {
        try {
            const userFormRepository = AppDataSource.getRepository(UserForm);
            const id = req.query.form_id as any;
            let userForm = await userFormRepository.findOne({ where: { user: { user_id: req.user.user_id }, form: { id } }, relations: ['form'] });

            if (!userForm) {
                return res.status(404).json({
                    message: 'User form not found',
                    status: false,
                });
            }

            return res.status(200).json({
                message: 'User form fetch successfully',
                status: true,
                data: userForm
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