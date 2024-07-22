import { Response } from 'express';
import { Innovation } from '../entity/Innovation.entity';
import { CustomRequest } from '../util/Interface/expressInterface';
import { AppDataSource } from '../data-source';
import { TimeLog } from '../entity/TimeLog.entity';

class TimeLogController {
    public async createTimeLog(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const timeLogRepository = AppDataSource.getRepository(TimeLog);

            const timeLog = await timeLogRepository.create(req.body);
            const savedTimeLog = await timeLogRepository.save(timeLog);

            return res.status(200).json({
                message: "Innovation created successfully",
                status: true,
                data: savedTimeLog
            });
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            });
        }
    }

    public async updateTimeLog(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const timeLogRepository = AppDataSource.getRepository(TimeLog);
            const id = parseInt(req.params.id);

            let timeLog = await timeLogRepository.findOne({ where: { id } });
            if (!timeLog) {
                return res.status(404).json({
                    message: "Time Log not found",
                    status: false
                });
            }

            timeLogRepository.merge(timeLog, req.body);
            timeLog = await timeLogRepository.save(timeLog);

            return res.status(200).json({
                message: "Time Log updated successfully",
                status: true,
                data: timeLog
            });
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            });
        }
    }

    public async deleteTimeLog(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            const timeLogRepository = AppDataSource.getRepository(TimeLog);

            const deleteResult = await timeLogRepository.delete(id);

            if (deleteResult.affected === 0) {
                return res.status(404).json({
                    message: 'Time Log not found',
                    status: false,
                });
            }

            return res.status(200).json({
                message: 'Time Log deleted successfully',
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

    public async getTimeLog(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const timeLogRepository = AppDataSource.getRepository(TimeLog);
            const id = parseInt(req.params.id);

            const timeLog = await timeLogRepository.findOne({ where: { id }, relations: ['course_id', "trainer_id"] })

            if (!timeLog) {
                return res.status(404).json({
                    message: "Time Log not found",
                    status: false
                });
            }

            return res.status(200).json({
                message: "Time Log fetched successfully",
                status: true,
                data: timeLog
            });
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            });
        }
    }

    public async getTimeLogs(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const timeLogRepository = AppDataSource.getRepository(TimeLog);
            const { pagination, user_id, approved } = req.query;

            const qb = timeLogRepository.createQueryBuilder('timelog')
                .leftJoinAndSelect('timelog.trainer_id', "trainer_id")
                .leftJoinAndSelect('timelog.course_id', "course_id")
                .leftJoin('timelog.user_id', "user_id")
                .select([
                    'timelog.id',
                    'timelog.activity_date',
                    'timelog.activity_type',
                    'timelog.unit',
                    'timelog.type',
                    'timelog.spend_time',
                    'timelog.start_time',
                    'timelog.end_time',
                    'timelog.impact_on_learner',
                    'timelog.evidence_link',
                    'timelog.verified',
                    'timelog.created_at',
                    'timelog.updated_at',
                    'trainer_id.user_id',
                    'trainer_id.user_name',
                    'trainer_id.email',
                    "course_id.course_id",
                    "course_id.course_name",
                    "course_id.course_code"
                ])
                .where('user_id.user_id = :user_id', { user_id })

            if (approved) {
                qb.andWhere('timelog.verified = :approved', { approved: true })
            }
            if (pagination) {
                qb.skip(req.pagination.skip)
                    .take(Number(req.pagination.limit))
            }

            const [timeLogs, count] = await qb
                .orderBy('timelog.created_at', 'DESC')
                .getManyAndCount();

            return res.status(200).json({
                message: "Time logs fetched successfully",
                status: true,
                data: timeLogs,
                ...((req.query.meta === "true" && pagination) && {
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
            });
        }
    }
}

export default TimeLogController;
