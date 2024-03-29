import { Request, Response } from "express";
import { User } from "../entity/User.entity";
import { AppDataSource } from "../data-source";
import { bcryptpassword, comparepassword } from "../util/bcrypt";
import { generateToken } from "../util/JwtAuth";
import { Learner } from "../entity/Learner.entity";
import { Equal } from "typeorm";
import { UserRole } from "../util/enum/user_enum";
import { deleteFromS3, uploadToS3 } from "../util/aws";
import { CustomRequest } from "../util/Interface/expressInterface";
import { sendPasswordByEmail } from "../util/mailSend";

class UserController {

    public async CreateUser(req: CustomRequest, res: Response) {
        try {
            const { user_name, first_name, last_name, email, password, confrimpassword, role } = req.body
            if (!user_name || !first_name || !last_name || !email || !password || !role || !confrimpassword) {
                return res.status(400).json({
                    message: "All Field Required",
                    status: false
                })
            }
            const userRepository = AppDataSource.getRepository(User)

            const userEmail = await userRepository.findOne({ where: { email: email } });

            if (userEmail) {
                return res.status(409).json({
                    message: "Email already exist",
                    status: false
                })
            }

            if (password !== confrimpassword) {
                return res.status(400).json({
                    message: "Password and confrim password not match",
                    status: false
                })
            }
            if (role === UserRole.Admin) {
                req.body.password_changed = true
            }



            req.body.password = await bcryptpassword(req.body.password)
            const user = await userRepository.create(req.body);

            const users: any = await userRepository.save(user)
            res.status(200).json({
                message: "User create successfully",
                status: true,
                data: users
            })

            sendPasswordByEmail(users.email, req.body.confrimpassword)

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
            const id: number = parseInt(req.user.user_id);

            const user = await userRepository
                .createQueryBuilder("user")
                .select(["user.user_name", "user.email", "user.sso_id", "user.avatar", "user.password_changed", "user.course"])
                .leftJoinAndSelect("user.course", "course")
                .where("user.user_id = :id", { id })
                .getOne();

            if (!user) {
                return res.status(404).json({
                    message: "User does not exist",
                    status: false
                });
            }

            return res.status(200).json({
                message: "User fetched successfully",
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
            const { user_name, first_name, last_name, sso_id, mobile, phone, role, time_zone, email } = req.body;
            const userId: number = parseInt(req.params.id);

            if (!user_name && !first_name && !last_name && !sso_id && !mobile && !phone && !role && !time_zone && !email) {
                return res.status(400).json({
                    message: "At least one field required",
                    status: false
                });
            }

            if (req.tokenrole !== UserRole.Admin && (Boolean(role) || Boolean(email) || Boolean(mobile) || Boolean(sso_id))) {
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
                    message: "User does not exist",
                    status: false
                })
            }

            for (const key in req.body) {
                (user as any)[key] = req.body[key];
            }

            const updatedUser = await userRepository.save(user)

            return res.status(200).json({
                message: "User updated successfully",
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
                    message: "Email and password field required",
                    status: false
                })
            }

            const user = await userRepository.findOne({
                where: { email: email },
            });

            if (!user) {
                return res.status(404).json({
                    message: "Invalid credentials, please try again.",
                    status: false
                })
            }

            const hashedPassword = await comparepassword(password, user.password)

            if (hashedPassword !== true) {
                return res.status(402).json({
                    message: "Invalid credentials, please try again.",
                    status: true
                })
            }

            let accessToken = generateToken({ ...user, displayName: user.first_name + " " + user.last_name })

            let responce = {
                password_changed: user.password_changed,
                accessToken: accessToken
            }
            return res.status(200).json({
                data: responce,
                message: "Login successful",
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
                    message: "Email and password field required",
                    status: false
                })
            }

            const user = await userRepository.findOne({
                where: { email: email },
            });

            if (!user) {
                return res.status(404).json({
                    message: "User does not exist",
                    status: false
                })
            }

            const hashedPassword = await bcryptpassword(req.body.password)
            user.password = hashedPassword;
            if (!user.password_changed) {
                user.password_changed = true;
            }

            await userRepository.save(user)

            return res.status(200).json({
                message: "Password changed successfully",
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

            const id: number = parseInt(req.params.id);

            const user = await userRepository.findOne({ where: { user_id: id } });

            if (!user) {
                return res.status(404).json({
                    message: "User does not exist",
                    status: false
                });
            }
            if (user.role === UserRole.Admin) {
                return res.status(403).json({
                    message: "Deleting admin account is restricted",
                    status: false
                })
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
                message: "User deleted successfully",
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
            const qb = userRepository.createQueryBuilder("user");

            if (req.query.keyword) {
                qb.andWhere("(user.email ILIKE :keyword OR user.user_name ILIKE :keyword OR user.first_name ILIKE :keyword OR user.last_name ILIKE :keyword)", { keyword: `${req.query.keyword}%` });

            }
            if (req.query.role) {
                qb.andWhere("user.role = :role", { role: req.query.role });

            }

            const [users, count] = await await qb
                .skip(Number(req.pagination.skip))
                .take(Number(req.pagination.limit))
                .orderBy("user.user_id", "ASC")
                .getManyAndCount();

            return res.status(200).json({
                message: "Users fetched successfully",
                status: false,
                data: users,
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
                message: "Internal Server Error",
                status: false,
                error: error.message
            })
        }
    }

    public async UploadAvatar(req: any, res: Response) {
        try {
            const userId: number = parseInt(req.user.user_id);

            if (!req.file) {
                return res.status(400).json({
                    message: "Avatar Field Required ",
                    status: false
                });
            }

            const userRepository = AppDataSource.getRepository(User)

            const user = await userRepository.findOne({
                where: { user_id: userId },
            });

            if (!user) {
                return res.status(404).json({
                    message: "User does not exist",
                    status: false
                })
            }

            if (user.avatar) {
                deleteFromS3(user.avatar)
            }
            user.avatar = await uploadToS3(req.file, "avatar")

            const updatedUser = await userRepository.save(user)

            return res.status(200).json({
                message: "Avatar uploaded successfully",
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