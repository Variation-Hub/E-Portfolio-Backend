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
                return res.status(512).json({
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
                message: "resquest successfull",
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

}

export default LearnerController;