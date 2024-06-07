import { Response } from "express";
import { AppDataSource } from "../data-source";
import { CustomRequest } from "../util/Interface/expressInterface";
import { Support, SupportStatus } from "../entity/Support.entity";

class SupportController {
    public async createSupport(req: CustomRequest, res: Response) {
        try {
            const { request_id, title, description } = req.body;
            if (!request_id || !title || !description) {
                return res.status(400).json({
                    message: "All fields are required",
                    status: false,
                });
            }
            const supportRepository = AppDataSource.getRepository(Support);

            const support = supportRepository.create({
                request_id: request_id,
                title,
                description,
            });

            const savedSupport = await supportRepository.save(support);
            res.status(200).json({
                message: "Support request created successfully",
                status: true,
                data: savedSupport,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error.message,
                status: false,
            });
        }
    }

    public async updateSupport(req: CustomRequest, res: Response) {
        try {
            const supportId = parseInt(req.params.id);
            const { title, description, status } = req.body;
            if (!title && !description && !status) {
                return res.status(400).json({
                    message: 'At least one field is required',
                    status: false,
                });
            }

            const supportRepository = AppDataSource.getRepository(Support);
            const support = await supportRepository.findOne({ where: { support_id: supportId } });

            if (!support) {
                return res.status(404).json({
                    message: 'Support request not found',
                    status: false,
                });
            }

            support.title = title || support.title;
            support.description = description || support.description;
            support.status = status || support.status;

            const updatedSupport = await supportRepository.save(support);
            return res.status(200).json({
                message: 'Support request updated successfully',
                status: true,
                data: updatedSupport,
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error',
                status: false,
                error: error.message,
            });
        }
    }

    public async getSupportList(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { status, keyword, request_id, meta } = req.query;
            const supportRepository = AppDataSource.getRepository(Support);

            const qb = supportRepository.createQueryBuilder('support')
                .leftJoinAndSelect('support.request_id', 'request')
                .select(['support', 'request.email', 'request.user_name']);

            if (status) {
                if (typeof status !== 'string' || !(status in SupportStatus)) {
                    return res.status(400).json({
                        message: 'Invalid status value',
                        status: false,
                    });
                }
                qb.andWhere('support.status = :status', { status: status as SupportStatus });
            }

            if (keyword) {
                qb.andWhere('(request.email ILIKE :keyword OR request.user_name ILIKE :keyword)', { keyword: `%${keyword}%` });
            }

            if (request_id) {
                qb.andWhere('request.user_id = :request_id', { request_id: request_id });
            }

            const [supports, count] = await qb
                .skip(Number(req.pagination.skip))
                .take(Number(req.pagination.limit))
                .orderBy('support.created_at', 'ASC')
                .getManyAndCount();

            return res.status(200).json({
                message: 'Support requests retrieved successfully',
                status: true,
                data: supports,
                ...(meta === 'true' && {
                    meta_data: {
                        page: req.pagination.page,
                        items: count,
                        page_size: req.pagination.limit,
                        pages: Math.ceil(count / req.pagination.limit),
                    },
                }),
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error',
                status: false,
                error: error.message,
            });
        }
    }


    public async deleteSupport(req: CustomRequest, res: Response) {
        try {
            const supportId = parseInt(req.params.id);
            const supportRepository = AppDataSource.getRepository(Support);
            const support = await supportRepository.findOne({ where: { support_id: supportId } });

            if (!support) {
                return res.status(404).json({
                    message: 'Support request not found',
                    status: false,
                });
            }

            await supportRepository.remove(support);
            return res.status(200).json({
                message: 'Support request deleted successfully',
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

export default SupportController;
