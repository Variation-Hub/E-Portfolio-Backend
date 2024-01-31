import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Learner } from "../entity/Learner.entity";
import { IUser, User } from "../entity/User.entity";
import { bcryptpassword } from "../util/bcrypt";
import { sendPasswordByEmail } from "../util/mailSend";
import { CustomRequest } from "../util/Interface/expressInterface";


class LearnerController {

    public async CreateLearner(req: CustomRequest, res: Response) {
        try {
            const { first_name, last_name, email, mobile, date_of_birth } = req.body
            if (!first_name || !last_name || !email || !mobile || !date_of_birth) {
                return res.status(400).json({
                    message: "All Field Required",
                    status: false
                })
            }
            const userRepository = AppDataSource.getRepository(User)
            const learnerRepository = AppDataSource.getRepository(Learner)

            req.body.password = await bcryptpassword(req.body.mobile)
            const user: any = await userRepository.save(await userRepository.create(req.body))

            req.body.user_id = user.user_id
            const learner = await learnerRepository.create(req.body);

            const savelearner = await learnerRepository.save(learner)

            const sendResult = await sendPasswordByEmail(email, mobile)
            if (!sendResult) {
                return res.status(500).json({
                    message: "Failed to send the email",
                    status: false,
                });
            }

            return res.status(200).json({
                message: "request successfull",
                status: true,
                data: savelearner
            })

        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error.message,
                status: false
            })
        }
    }

    public async getLearner(req: Request, res: Response): Promise<Response> {
        try {
            const learnerId: number = parseInt(req.params.id);
            const learnerRepository = AppDataSource.getRepository(Learner);
            const learner = await learnerRepository.findOne({ where: { learner_id: learnerId } });

            if (!learner) {
                return res.status(404).json({
                    message: 'Learner not found',
                    status: false,
                });
            }

            return res.status(200).json({
                message: 'Learner retrieved successfully',
                status: true,
                data: learner,
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error',
                error: error.message,
                status: false,
            });
        }
    }

    public async updateLearner(req: Request, res: Response): Promise<Response> {
        try {
            const learnerId: number = parseInt(req.params.id);

            const learnerRepository = AppDataSource.getRepository(Learner);
            const existingLearner = await learnerRepository.findOne({ where: { learner_id: learnerId } });

            if (!existingLearner) {
                return res.status(404).json({
                    message: 'Learner not found',
                    status: false,
                });
            }

            learnerRepository.merge(existingLearner, req.body);
            const updatedLearner = await learnerRepository.save(existingLearner);

            return res.status(200).json({
                message: 'Learner updated successfully',
                status: true,
                data: updatedLearner,
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error',
                error: error.message,
                status: false,
            });
        }
    }

    public async deleteLearner(req: Request, res: Response): Promise<Response> {
        try {
            const learnerId: number = parseInt(req.params.id);
            const learnerRepository = AppDataSource.getRepository(Learner);
            const learner = await learnerRepository.findOne({ where: { learner_id: learnerId } });

            if (!learner) {
                return res.status(404).json({
                    message: 'Learner not found',
                    status: false,
                });
            }

            await learnerRepository.remove(learner);

            return res.status(200).json({
                message: 'Learner deleted successfully',
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

export default LearnerController;