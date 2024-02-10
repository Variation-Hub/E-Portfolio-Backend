import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Resource } from '../entity/Resource.entity';
import { CustomRequest } from '../util/Interface/expressInterface';
import { Unit } from '../entity/Unit.entity';
import { uploadToS3 } from '../util/aws';
import { User } from '../entity/User.entity';
import { ResourceStatus } from '../entity/ResourceStatus.entity';
import { Equal, FindOperator } from 'typeorm';

class ResourceStatusController {

    public async getUnitResources(req: CustomRequest, res: Response) {
        try {
            const unitId = parseInt(req.params.id);
            const userId = req.user.user_id;

            const unitRepository = AppDataSource.getRepository(Unit);
            const unit = await unitRepository
                .createQueryBuilder('unit')
                .leftJoinAndSelect('unit.resources', 'resources')
                .leftJoinAndSelect('resources.resourceStatus', 'resourceStatus', 'resourceStatus.unit_id = :userId', { userId })
                .where('unit.unit_id = :unitId', { unitId })
                .getOne();

            if (!unit) {
                return res.status(404).json({
                    message: 'Unit not found',
                    status: false,
                });
            }

            const resources = unit.resources.map(resource => ({
                ...resource,
                isAccessed: resource.resourceStatus.length > 0,
            }));

            return res.status(200).json({
                message: 'Resources retrieved successfully',
                status: true,
                data: resources,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: 'Internal Server Error',
                status: false,
                error: error.message,
            });
        }
    }

    // public async logResourceAccess(req: CustomRequest, res: Response) {
    //     try {
    //         const userId = req.user.id; // Assuming you have a user object with an 'id' property
    //         const resourceId = parseInt(req.params.resourceId);

    //         const user = await AppDataSource.getRepository(User).findOne(userId);
    //         const resourceStatusRepository = AppDataSource.getRepository(ResourceStatus);

    //         // Check if the user has already accessed the resource
    //         const existingResourceStatus = await resourceStatusRepository.findOne({
    //             where: {
    //                 user_id: userId,
    //                 resourceId,
    //             },
    //         });

    //         if (existingResourceStatus) {
    //             return res.status(400).json({
    //                 message: 'User has already accessed this resource',
    //                 status: false,
    //             });
    //         }

    //         // Log the resource access
    //         const newResourceStatus = resourceStatusRepository.create({
    //             userId,
    //             resourceId,
    //             last_viewed: new Date().toISOString(), // You may adjust this based on your requirements
    //         });

    //         await resourceStatusRepository.save(newResourceStatus);

    //         return res.status(200).json({
    //             message: 'Resource access logged successfully',
    //             status: true,
    //         });
    //     } catch (error) {
    //         console.error(error);
    //         return res.status(500).json({
    //             message: 'Internal Server Error',
    //             status: false,
    //             error: error.message,
    //         });
    //     }

    // }

    public async addResourceStatus(req: Request, res: Response) {
        const { resource_id, user_id } = req.body;

        const resourceStatusRepository = AppDataSource.getRepository(ResourceStatus);
        const userRepository = AppDataSource.getRepository(User);

        try {
            let resourceStatus = await resourceStatusRepository.findOne({
                relations: ['resource', 'user'],
                where: {
                    resource: { resource_id: Number(resource_id) },
                    user: { user_id },
                },
            });
            console.log(resourceStatus, "++++++++++++++++++++++++++++++++++++++++++++++++");
            const user = await userRepository.findOne({ where: { user_id: parseInt(user_id) } })

            if (!user) {
                return res.status(404).json({ message: 'User not found', status: false });
            }
            if (!resourceStatus) {
                resourceStatus = await resourceStatusRepository.create({ user, resource: resource_id, last_viewed: new Date() });
            }

            resourceStatus.user = user;
            resourceStatus.last_viewed = new Date()

            const a = await resourceStatusRepository.save(resourceStatus);
            console.log(a, "response")
            return res.status(200).json({ message: 'User added to ResourceStatus successfully', status: true });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

}
export default ResourceStatusController;
