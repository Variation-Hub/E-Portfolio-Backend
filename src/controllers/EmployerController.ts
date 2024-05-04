import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Learner } from "../entity/Learner.entity";
import { User } from "../entity/User.entity";
import { bcryptpassword, generatePassword } from "../util/bcrypt";
import { sendPasswordByEmail } from "../util/mailSend";
import { CustomRequest } from "../util/Interface/expressInterface";
import { Employer } from "../entity/Employer.entity";
import { UserRole } from "../util/constants";


class EmployerController {

    public async createEmployer(req: CustomRequest, res: Response) {
        try {
            const {
                employer_name,
                msi_employer_id,
                business_department,
                business_location,
                branch_code,
                address_1,
                address_2,
                city,
                country,
                postal_code,
                edrs_number,
                business_category,
                number,
                external_data_code,
                telephone,
                website,
                key_contact,
                business_description,
                comments,
                email
            } = req.body
            if (!employer_name ||
                !msi_employer_id ||
                !business_department ||
                !business_location ||
                !branch_code ||
                !address_1 ||
                !address_2 ||
                !city ||
                !country ||
                !postal_code ||
                !edrs_number ||
                !business_category ||
                !number ||
                !external_data_code ||
                !telephone ||
                !website ||
                !key_contact ||
                !business_description ||
                !comments ||
                !email) {
                return res.status(400).json({
                    message: "All Field Required",
                    status: false
                })
            }
            const userRepository = AppDataSource.getRepository(User)
            const employerRepository = AppDataSource.getRepository(Employer)

            const userEmail = await userRepository.findOne({ where: { email: email } });

            if (userEmail) {
                return res.status(409).json({
                    message: "Email already exist",
                    status: false
                })
            }

            const password = generatePassword()
            req.body.password = await bcryptpassword(password)

            let employer = await employerRepository.save(employerRepository.create({
                employer_name,
                msi_employer_id,
                business_department,
                business_location,
                branch_code,
                address_1,
                address_2,
                city,
                country,
                postal_code,
                edrs_number,
                business_category,
                external_data_code,
                telephone,
                website,
                key_contact,
                business_description,
                comments,
            }));

            let user = userRepository.create({
                email,
                password: req.body.password,
                mobile: number,
                roles: [UserRole.Employer],
                employer: employer
            });

            user = await userRepository.save(user);

            employer.user = user;
            employer = await employerRepository.save(employer);


            const sendResult = await sendPasswordByEmail(email, password)
            if (!sendResult) {
                return res.status(500).json({
                    message: "Failed to send the email",
                    status: false,
                });
            }

            return res.status(200).json({
                message: "Employer create successfully",
                status: true,
                data: user
            })

        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error.message,
                status: false
            })
        }
    }

    public async getEmployerList(req: Request, res: Response): Promise<Response> {
        try {
            const employerRepository = AppDataSource.getRepository(Employer);

            const qb = employerRepository.createQueryBuilder("employer")
                .leftJoinAndSelect("employer.user", "user")

            if (req.query.keyword) {
                qb.andWhere("(learner.email ILIKE :keyword OR learner.user_name ILIKE :keyword OR learner.first_name ILIKE :keyword OR learner.last_name ILIKE :keyword)", { keyword: `${req.query.keyword}%` });
            }
            const [employer, count] = await qb
                .skip(Number(req.pagination.skip))
                .take(Number(req.pagination.limit))
                .orderBy("employer.employer_id", "ASC")
                .getManyAndCount();

            return res.status(200).json({
                message: "Employer fetched successfully",
                status: true,
                data: employer,
                ...(req.query.meta === "true" && {
                    meta_data: {
                        page: req.pagination.page,
                        items: count,
                        page_size: req.pagination.limit,
                        pages: Math.ceil(count / req.pagination.limit)
                    }
                })
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error',
                error: error.message,
                status: false,
            });
        }
    }

    public async updateEmployer(req: Request, res: Response): Promise<Response> {
        try {
            const employerId: number = parseInt(req.params.id);

            const employerRepository = AppDataSource.getRepository(Learner);
            const existingEmployer = await employerRepository.findOne({ where: { employer_id: employerId } });

            if (!existingEmployer) {
                return res.status(404).json({
                    message: 'Employer not found',
                    status: false,
                });
            }

            employerRepository.merge(existingEmployer, req.body);
            const updatedEmployer = await employerRepository.save(existingEmployer);

            return res.status(200).json({
                message: 'Employer updated successfully',
                status: true,
                data: updatedEmployer,
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error',
                error: error.message,
                status: false,
            });
        }
    }

    public async deleteEmployer(req: Request, res: Response): Promise<Response> {
        try {
            const employerId: number = parseInt(req.params.id);

            const employerRepository = AppDataSource.getRepository(Employer);
            const userRepository = AppDataSource.getRepository(User);

            const employer = await employerRepository.findOne({ where: { employer_id: employerId }, relations: ['user'] });

            if (!employer) {
                return res.status(404).json({
                    message: 'Employer not found',
                    status: false,
                });
            }

            await userRepository.softDelete(employer.user.user_id);
            await employerRepository.softDelete(employer.employer_id);

            return res.status(200).json({
                message: 'Employer deleted successfully',
                status: true,
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error',
                error: error.message,
                status: false,
            });
        }
    }

}

export default EmployerController;