import { Request, Response } from "express";
import { User } from "../entity/User.entity";
import { AppDataSource } from "../data-source";
import { bcryptpassword, comparepassword } from "../util/bcrypt";
import { generateToken } from "../util/JwtAuth";
import { Learner } from "../entity/Learner.entity";
import { Equal, Like } from "typeorm";
import { UserRole } from "../util/enum/user_enum";
import { deleteFromS3, uploadToS3 } from "../util/aws";
import { CustomRequest } from "../util/Interface/expressInterface";

class UserController {

    public async CreateUser(req: CustomRequest, res: Response) {
        try {
            const { user_name, first_name, last_name, email, password, confrimpassword, sso_id, role } = req.body
            if (!user_name || !first_name || !last_name || !email || !password || !sso_id || !role || !confrimpassword) {
                return res.status(400).json({
                    message: "all Field Required",
                    status: false
                })
            }

            if (password !== confrimpassword) {
                return res.status(400).json({
                    message: "password and confrimpassword not match",
                    status: false
                })
            }

            const userRepository = AppDataSource.getRepository(User)

            req.body.password = await bcryptpassword(req.body.password)
            const user = await userRepository.create(req.body);

            const users = await userRepository.save(user)
            return res.status(200).json({
                message: "resquest successfull",
                status: true,
                data: users
            })

        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            })
        }
    }

    public async GetUser(req: CustomRequest, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User)
            const id: number = parseInt(req.token.user_id);

            const user = await userRepository
                .createQueryBuilder("user")
                .select(["user.user_name", "user.email", "user.sso_id", "user.avatar", "user.password_changed"])
                .where("user.user_id = :id", { id })
                .getOne();

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                    status: false
                });
            }

            return res.status(200).json({
                message: "User get successfully",
                status: false,
                data: user
            })


        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            })
        }
    }

    public async UpdateUser(req: any, res: Response) {
        try {
            const { user_name, first_name, last_name, sso_id, mobile, phone, role, time_zone } = req.body;
            const userId: number = parseInt(req.params.id);

            if (!user_name && !first_name && !last_name && !sso_id && !mobile && !phone && !role && !time_zone) {
                return res.status(400).json({
                    message: "At least one Field Required ",
                    status: false
                });
            }
            console.log(req.tokenrole !== UserRole.Admin, Boolean(role), req.tokenrole)
            if (req.tokenrole !== UserRole.Admin && Boolean(role)) {
                return res.status(401).json({
                    message: "Admin role is required",
                    status: false
                })
            }


            const userRepository = AppDataSource.getRepository(User)

            const user = await userRepository.findOne({
                where: { user_id: userId },
            });

            if (!user) {
                return res.status(404).json({
                    message: "user not found",
                    status: false
                })
            }

            for (const key in req.body) {
                if (key === "user_name" || key === "first_name" || key === "last_name" || key === "sso_id" || key === "mobile" || key === "phone" || key === "role" || key === "time_zone") {
                    (user as any)[key] = req.body[key];
                }
            }

            const updatedUser = await userRepository.save(user)

            return res.status(200).json({
                message: "resquest successfull",
                status: true,
                data: updatedUser
            })

        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            })
        }
    }

    public async LoginUser(req: Request, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User)

            const { email, password } = req.body
            if (!email || !password) {
                return res.status(400).json({
                    message: "password and email Field Required",
                    status: false
                })
            }

            const user = await userRepository.findOne({
                where: { email: email },
            });

            if (!user) {
                return res.status(404).json({
                    message: "user not found",
                    status: false
                })
            }

            const hashedPassword = await comparepassword(password, user.password)

            if (hashedPassword !== true) {
                return res.status(402).json({
                    message: "Wrong Password",
                    status: true
                })
            }

            let accessToken = generateToken({ user_id: user.user_id, user_name: user.user_name, email: user.email, role: user.role })

            let responce = {
                user_id: user.user_id,
                user_name: user.user_name,
                email: user.email,
                sso_id: user.sso_id,
                avatar: user.avatar,
                password_changed: user.password_changed,
                accessToken: accessToken
            }
            return res.status(200).json({
                data: responce,
                message: "User Login Successfully",
                status: true
            })

        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                status: false
            })
        }
    }


    public async PasswordChangeUser(req: Request, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User)

            const { email, password } = req.body
            if (!email || !password) {
                return res.status(400).json({
                    message: "password and email Field Required",
                    status: false
                })
            }

            const user = await userRepository.findOne({
                where: { email: email },
            });

            if (!user) {
                return res.status(404).json({
                    message: "user not found",
                    status: false
                })
            }

            const hashedPassword = await bcryptpassword(req.body.password)
            user.password = hashedPassword

            await userRepository.save(user)

            return res.status(200).json({
                message: "password changed successfully",
                status: true
            })

        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                status: false
            })
        }
    }

    public async DeleteUser(req: CustomRequest, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const learnerRepository = AppDataSource.getRepository(Learner);

            const id: number = parseInt(req.token.user_id);

            const user = await userRepository.findOne({ where: { user_id: id } });

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                    status: false
                });
            }
            if (user?.avatar) {
                deleteFromS3(user.avatar)
            }

            const learners = await learnerRepository.findOneBy({ user_id: Equal(id) });
            if (learners) {
                await learnerRepository.remove(learners);
            }

            await userRepository.remove(user);

            return res.status(200).json({
                message: "User and related learners deleted successfully",
                status: true
            });

        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                status: false
            });
        }
    }

    public async GetUserList(req: any, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User)
            let whereClause: any = {};

            if (req.query.email) {
                whereClause.email = Like(`%${req.query.email}%`);
            }
            if (req.query.user_name) {
                whereClause.user_name = Like(`%${req.query.user_name}%`);
            }
            if (req.query.role) {
                whereClause.role = req.query.role;
            }

            const [users, count] = await userRepository.findAndCount(
                {
                    where: whereClause,
                    skip: Number(req.pagination.skip),
                    take: Number(req.pagination.limit),
                    order: { user_id: "ASC" }
                }
            )

            if (users.length <= 0) {
                return res.status(404).json({
                    message: "Users not found",
                    status: false
                });
            }

            return res.status(200).json({
                message: "User get successfully",
                status: false,
                data: users,
                page: req.pagination.page,
                total: Math.ceil(count / req.pagination.limit)
            })


        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            })
        }
    }

    public async UploadAvatar(req: any, res: Response) {
        try {
            const userId: number = parseInt(req.token.user_id);

            if (!req.file) {
                return res.status(400).json({
                    message: "avatar Field Required ",
                    status: false
                });
            }

            const userRepository = AppDataSource.getRepository(User)

            const user = await userRepository.findOne({
                where: { user_id: userId },
            });

            if (!user) {
                return res.status(404).json({
                    message: "user not found",
                    status: false
                })
            }

            if (user.avatar) {
                deleteFromS3(user.avatar)
            }
            user.avatar = await uploadToS3(req.file, "avatar")

            const updatedUser = await userRepository.save(user)

            return res.status(200).json({
                message: "resquest successfull",
                status: true,
                data: updatedUser
            })

        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            })
        }
    }
}

export default UserController;