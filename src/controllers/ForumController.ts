import { Response } from "express";
import { CustomRequest } from "../util/Interface/expressInterface";
import { AppDataSource } from "../data-source";
import { Notification } from "../entity/Notification.entity";
import { Forum } from "../entity/Forum.entity";
import { UserCourse } from "../entity/UserCourse.entity";
import { sendDataTOUser } from "../socket/socketEvent";
import { SocketDomain, SocketEvents } from "../util/constants";
import { deleteFromS3, uploadToS3 } from "../util/aws";

class ForumController {
    constructor() {
        this.sendMessage = this.sendMessage.bind(this);
        this.updateMessage = this.updateMessage.bind(this);
        this.getCourseUserIds = this.getCourseUserIds.bind(this);
    }

    getCourseUserIds = async (course_id: number) => {
        const userCourseRepository = AppDataSource.getRepository(UserCourse)

        const userCourses = await userCourseRepository.createQueryBuilder('user_course')
            .leftJoin('user_course.learner_id', 'learner')
            .leftJoin('learner.user_id', 'learner_user')
            .leftJoin('user_course.trainer_id', 'trainer')
            .leftJoin('user_course.IQA_id', 'IQA')
            .leftJoin('user_course.LIQA_id', 'LIQA')
            .leftJoin('user_course.EQA_id', 'EQA')
            .leftJoin('user_course.employer_id', 'employer')
            .where('user_course.course->>\'course_id\' = :course_id', { course_id })
            .select([
                'learner_user.user_id',
                'trainer.user_id AS trainer_id',
                'IQA.user_id AS iqa_id',
                'LIQA.user_id AS liqa_id',
                'EQA.user_id AS eqa_id',
                'employer.user_id AS employer_id'
            ])
            .getRawMany();
        const uniqueUserIdSet = new Set<number>();
        userCourses.forEach(ids => {
            uniqueUserIdSet.add(ids.learner_user_user_id);
            uniqueUserIdSet.add(ids.trainer_id);
            uniqueUserIdSet.add(ids.iqa_id);
            uniqueUserIdSet.add(ids.liqa_id);
            uniqueUserIdSet.add(ids.eqa_id);
            uniqueUserIdSet.add(ids.employer_id);
        });
        return Array.from(uniqueUserIdSet)
    }

    public async sendMessage(req: CustomRequest, res: Response) {
        try {
            const forumRepository = AppDataSource.getRepository(Forum)
            const { course_id, message } = req.body

            let file
            if (req.file) {
                file = await uploadToS3(req.file, "Forum")
            }

            let forum = forumRepository.create({ sender: req.user.user_id, course: course_id, message, file })
            forum = await forumRepository.save(forum)

            const uniqueUserIdArray = await this.getCourseUserIds(course_id)
            sendDataTOUser(SocketEvents.Message, uniqueUserIdArray, { ...forum, domain: SocketDomain.MessageSend })

            return res.status(200).json({
                message: "Message send successfully",
                status: true,
                data: forum
            })

        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            })
        }
    }

    public async updateMessage(req: CustomRequest, res: Response) {
        try {
            const forumRepository = AppDataSource.getRepository(Forum)
            const id = parseInt(req.params.id)
            const { message } = req.body

            let forum = await forumRepository.findOne({ where: { id }, relations: ['course'] })

            if (!forum) {
                return res.status(404).json({
                    message: "Message Not Found",
                    status: false
                })
            }

            forum.message = message || forum.message
            if (req.file) {
                deleteFromS3(forum.file)
                forum.file = await uploadToS3(req.file, "Forum")
            }
            forum = await forumRepository.save(forum)

            const uniqueUserIdArray = await this.getCourseUserIds(forum.course.course_id)
            sendDataTOUser(SocketEvents.Message, uniqueUserIdArray, { ...forum, domain: SocketDomain.MessageUpdate })
            delete forum.course

            return res.status(200).json({
                message: "Message update successfully",
                status: true,
                data: forum
            })

        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            })
        }
    }

    public async deleteForum(req: CustomRequest, res: Response) {
        try {
            const forumRepository = AppDataSource.getRepository(Forum)
            const id = parseInt(req.params.id)

            const deleteResult = await forumRepository.delete(id);

            if (deleteResult.affected === 0) {
                return res.status(404).json({
                    message: 'Message not found',
                    status: false,
                });
            }

            res.status(200).json({
                message: 'Message delete successfully',
                status: true,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error.message,
                status: false,
            });
        }
    }

    public async getMessages(req: CustomRequest, res: Response) {
        try {
            const forumRepository = AppDataSource.getRepository(Forum)
            const course_id = parseInt(req.params.course_id)

            const qb = forumRepository.createQueryBuilder('forum')
                .innerJoin('forum.course', 'course')
                .innerJoin('forum.sender', 'sender')
                .where('course.course_id = :course_id', { course_id })
                .select([
                    'forum.id',
                    'forum.message',
                    'forum.created_at',
                    'sender.user_id',
                    'sender.user_name',
                    'sender.avatar',
                ])

            const [forum, count] = await qb
                .skip(Number(req.pagination.skip))
                .take(Number(req.pagination.limit))
                .orderBy('forum.created_at', 'DESC')
                .getManyAndCount();

            return res.status(200).json({
                message: 'Messages retrieved successfully',
                status: true,
                data: forum,
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
                message: "Internal Server Error",
                status: false,
                error: error.message
            })
        }
    }

}

export default ForumController;