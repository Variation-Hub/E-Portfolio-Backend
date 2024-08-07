import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Learner } from "../entity/Learner.entity";
import { User } from "../entity/User.entity";
import { bcryptpassword } from "../util/bcrypt";
import { sendPasswordByEmail } from "../util/mailSend";
import { CustomRequest } from "../util/Interface/expressInterface";
import { UserCourse } from "../entity/UserCourse.entity";
import { Assignment } from "../entity/Assignment.entity";


class LearnerController {

    public async CreateLearner(req: CustomRequest, res: Response) {
        try {
            const { user_name, first_name, last_name, email, password, confrimpassword, mobile, funding_body } = req.body
            if (!user_name || !first_name || !last_name || !email || !password || !confrimpassword) {
                return res.status(400).json({
                    message: "All Field Required",
                    status: false
                })
            }
            const userRepository = AppDataSource.getRepository(User)
            const learnerRepository = AppDataSource.getRepository(Learner)

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

            req.body.password = await bcryptpassword(req.body.password)
            const user: any = await userRepository.save(await userRepository.create(req.body))

            req.body.user_id = user.user_id
            const learner = await learnerRepository.create(req.body);

            const savelearner = await learnerRepository.save(learner)

            const sendResult = await sendPasswordByEmail(email, password)
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

    public async getLearnerList(req: Request, res: Response): Promise<Response> {
        try {
            const { user_id, role } = req.query as any;
            const learnerRepository = AppDataSource.getRepository(Learner);
            const userCourseRepository = AppDataSource.getRepository(UserCourse);

            let learnerIdsArray
            let usercourses
            if (user_id && role) {
                const obj: any = {
                    EQA: "EQA_id",
                    IQA: "IQA_id",
                    LIQA: "LIQA_id",
                    Employer: "employer_id",
                    Trainer: "trainer_id"
                };
                usercourses = await userCourseRepository.createQueryBuilder("user_course")
                    .leftJoin(`user_course.${obj[role]}`, `user_id`)
                    .leftJoinAndSelect(`user_course.learner_id`, `learner_id`)
                    .leftJoinAndSelect(`user_course.trainer_id`, `trainer_id`)
                    .leftJoinAndSelect(`user_course.IQA_id`, `IQA_id`)
                    .leftJoinAndSelect(`user_course.LIQA_id`, `LIQA_id`)
                    .leftJoinAndSelect(`user_course.EQA_id`, `EQA_id`)
                    .leftJoinAndSelect(`user_course.employer_id`, `employer_id`)
                    .leftJoinAndSelect(`employer_id.employer`, `employer`)
                    .andWhere('user_id.user_id = :user_id', { user_id })
                    .getMany();
                learnerIdsArray = usercourses.map(userCourse => userCourse.learner_id.learner_id);
            }
            const qb = learnerRepository.createQueryBuilder("learner")
                .leftJoinAndSelect('learner.user_id', "user_id")
                .select([
                    'learner.learner_id',
                    'learner.first_name',
                    'learner.last_name',
                    'learner.user_name',
                    'learner.email',
                    'learner.mobile',
                    'learner.national_ins_no',
                    'learner.employer_id',
                    'learner.funding_body',
                    'learner.created_at',
                    'learner.updated_at',
                    'user_id.user_id',
                    'user_id.avatar'
                ])

            if (req.query.keyword) {
                qb.andWhere("(learner.email ILIKE :keyword OR learner.user_name ILIKE :keyword OR learner.first_name ILIKE :keyword OR learner.last_name ILIKE :keyword)", { keyword: `${req.query.keyword}%` });
            }
            if (role && user_id && learnerIdsArray.length) {
                qb.andWhere('learner.learner_id IN (:...learnerIdsArray)', { learnerIdsArray })
            } else if (role && user_id) {
                qb.andWhere('0 = 1')
            }
            const [learner, count] = await qb
                .skip(Number(req.pagination.skip))
                .take(Number(req.pagination.limit))
                .orderBy("learner.learner_id", "ASC")
                .getManyAndCount();

            let formattedLearners
            if (role && user_id && learnerIdsArray.length) {
                formattedLearners = learner.map((learner: any) => ({
                    ...learner,
                    user_id: learner.user_id.user_id,
                    avatar: learner.user_id?.avatar?.url,
                    course: usercourses.filter(usercourse => {
                        if (usercourse.learner_id.learner_id === learner.learner_id) {
                            return true;
                        }
                    })
                }))
            } else {
                formattedLearners = learner.map((learner: any) => ({
                    ...learner,
                    user_id: learner.user_id.user_id,
                    avatar: learner.user_id?.avatar?.url
                }));
            }

            for (let index in formattedLearners) {
                formattedLearners[index].course = await getCourseData(formattedLearners[index].course, formattedLearners[index].user_id);
            }

            return res.status(200).json({
                message: "Learner fetched successfully",
                status: true,
                data: formattedLearners,
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

    public async getLearner(req: Request, res: Response): Promise<Response> {
        try {
            const learner_id = req.params.id as any;
            const learnerRepository = AppDataSource.getRepository(Learner);
            const userCourseRepository = AppDataSource.getRepository(UserCourse);
            const assignmentCourseRepository = AppDataSource.getRepository(Assignment);
            const learner: any = await learnerRepository
                .createQueryBuilder('learner')
                .leftJoin('learner.user_id', 'user')
                .addSelect(['user.user_id', 'user.user_name', 'user.avatar'])
                .where('learner.learner_id = :learner_id', { learner_id })
                .getOne();

            if (!learner) {
                return res.status(404).json({
                    message: 'Learner not found',
                    status: false,
                });
            }

            let courses = await userCourseRepository.find({ where: { learner_id }, relations: ["trainer_id", "IQA_id", "LIQA_id", "EQA_id", "employer_id", "employer_id.employer"] })

            const course_ids = courses.map((course: any) => course.course.course_id)
            const filteredAssignments = course_ids.length ? await assignmentCourseRepository.createQueryBuilder('assignment')
                .leftJoin("assignment.course_id", 'course')
                .where('assignment.course_id IN (:...course_ids)', { course_ids })
                .andWhere('assignment.user_id = :user_id', { user_id: learner.user_id.user_id })
                .select(['assignment', 'course.course_id'])
                .getMany() : [];

            courses = courses.map((userCourse: any) => {
                let partiallyCompleted = new Set();
                let fullyCompleted = new Set();

                let courseAssignments: any = filteredAssignments.filter(assignment => assignment.course_id.course_id === userCourse.course.course_id);

                courseAssignments?.forEach((assignment) => {
                    assignment.units?.forEach(unit => {
                        unit.subUnit?.forEach(subunit => {
                            if (fullyCompleted.has(subunit.id)) {
                                return;
                            }
                            else if (partiallyCompleted.has(subunit)) {
                                if (subunit?.learnerMap && subunit?.trainerMap) {
                                    fullyCompleted.add(subunit.id)
                                    partiallyCompleted.delete(subunit.id)
                                }
                            }
                            else if (subunit?.learnerMap && subunit?.trainerMap) {
                                fullyCompleted.add(subunit.id)
                            }
                            else if (subunit?.learnerMap || subunit?.trainerMap) {
                                partiallyCompleted.add(subunit.id)
                            }
                        });
                    });
                })

                const totalSubUnits = userCourse.course.units?.reduce((count, unit) => {
                    return count + (unit.subUnit?.length || 0);
                }, 0) || 0;
                return {
                    ...userCourse,
                    totalSubUnits,
                    notStarted: totalSubUnits - (fullyCompleted.size + partiallyCompleted.size),
                    partiallyCompleted: partiallyCompleted.size,
                    fullyCompleted: fullyCompleted.size,
                }
            })
            return res.status(200).json({
                message: 'Learner retrieved successfully',
                status: true,
                data: { ...learner, ...learner.user_id, avatar: learner.user_id?.avatar?.url, course: courses },
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
            const userRepository = AppDataSource.getRepository(User);
            const learner = await learnerRepository.findOne({ where: { learner_id: learnerId }, relations: ['user_id'] });

            if (!learner) {
                return res.status(404).json({
                    message: 'Learner not found',
                    status: false,
                });
            }

            if (learner.user_id) {
                await userRepository.softDelete(learner.user_id.user_id)
            }
            await learnerRepository.softDelete(learner.learner_id);


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

    public async getLearnerByToken(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const id = req.user.user_id;

            const learnerRepository = AppDataSource.getRepository(Learner);
            const learner = await learnerRepository.findOne({ where: { user_id: id } })

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
}

export default LearnerController;

const getCourseData = async (courses: any[], user_id: string) => {
    try {
        console.log("log sratart 111111111111111111111111111111111111")
        const assignmentCourseRepository = AppDataSource.getRepository(Assignment);
        const course_ids = courses.map((course: any) => course.course.course_id)
        const filteredAssignments = course_ids.length ? await assignmentCourseRepository.createQueryBuilder('assignment')
            .leftJoin("assignment.course_id", 'course')
            .where('assignment.course_id IN (:...course_ids)', { course_ids })
            .andWhere('assignment.user_id = :user_id', { user_id })
            .select(['assignment', 'course.course_id'])
            .getMany() : [];

        courses = courses.map((userCourse: any) => {
            let partiallyCompleted = new Set();
            let fullyCompleted = new Set();

            let courseAssignments: any = filteredAssignments.filter(assignment => assignment.course_id.course_id === userCourse.course.course_id);

            courseAssignments?.forEach((assignment) => {
                assignment.units?.forEach(unit => {
                    unit.subUnit?.forEach(subunit => {
                        if (fullyCompleted.has(subunit.id)) {
                            return;
                        }
                        else if (partiallyCompleted.has(subunit)) {
                            if (subunit?.learnerMap && subunit?.trainerMap) {
                                fullyCompleted.add(subunit.id)
                                partiallyCompleted.delete(subunit.id)
                            }
                        }
                        else if (subunit?.learnerMap && subunit?.trainerMap) {
                            fullyCompleted.add(subunit.id)
                        }
                        else if (subunit?.learnerMap || subunit?.trainerMap) {
                            partiallyCompleted.add(subunit.id)
                        }
                    });
                });
            })

            const totalSubUnits = userCourse.course.units?.reduce((count, unit) => {
                return count + (unit.subUnit?.length || 0);
            }, 0) || 0;
            return {
                ...userCourse,
                totalSubUnits,
                notStarted: totalSubUnits - (fullyCompleted.size + partiallyCompleted.size),
                partiallyCompleted: partiallyCompleted.size,
                fullyCompleted: fullyCompleted.size,
            }
        })
        console.log(courses)
        return courses
    } catch (error) {
        console.log(error, "Error in getting course data");
        return {};
    }
}