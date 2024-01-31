import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Resource } from '../entity/Resource.entity';
import { CustomRequest } from '../util/Interface/expressInterface';
import { Unit } from '../entity/Unit.entity';

class ResourceController {
    public async createResource(req: CustomRequest, res: Response) {
        try {
            const { unitId, name, discription, size } = req.body;

            if (!unitId || !name || !discription || !size) {
                return res.status(400).json({
                    message: 'All fields are required',
                    status: false,
                });
            }

            const resourceRepository = AppDataSource.getRepository(Resource);
            const unitRepository = AppDataSource.getRepository(Unit);

            const unit = await unitRepository.findOne(unitId);

            if (!unit) {
                return res.status(404).json({
                    message: 'Unit not found',
                    status: false,
                });
            }

            const resource = resourceRepository.create({
                unit_id: unit,
                name,
                discription,
                size,
            });

            const savedResource = await resourceRepository.save(resource);

            return res.status(200).json({
                message: 'Resource created successfully',
                status: true,
                data: savedResource,
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

    public async getResources(req: Request, res: Response) {
        try {
            const resourceId = parseInt(req.params.id);
            const resourceRepository = AppDataSource.getRepository(Resource);

            const resources = await resourceRepository.find();

            return res.status(200).json({
                message: 'Resources fetched successfully',
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

    public async getResource(req: Request, res: Response) {
        try {
            const resourceId = parseInt(req.params.id);
            const resourceRepository = AppDataSource.getRepository(Resource);

            const resource = await resourceRepository.findOne({ where: { resource_id: resourceId } });

            if (!resource) {
                return res.status(404).json({
                    message: 'Resource not found',
                    status: false,
                });
            }

            return res.status(200).json({
                message: 'Resource fetched successfully',
                status: true,
                data: resource,
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

    public async updateResource(req: CustomRequest, res: Response) {
        try {
            const resourceId = parseInt(req.params.id);
            const { unitId, name, discription, size } = req.body;

            if (!unitId && !name && !discription && !size) {
                return res.status(400).json({
                    message: 'At least one field required',
                    status: false,
                });
            }

            const resourceRepository = AppDataSource.getRepository(Resource);
            const unitRepository = AppDataSource.getRepository(Unit);

            const resource = await resourceRepository.findOne({ where: { resource_id: resourceId } });

            if (!resource) {
                return res.status(404).json({
                    message: 'Resource not found',
                    status: false,
                });
            }

            if (unitId) {
                const unit = await unitRepository.findOne(unitId);

                if (!unit) {
                    return res.status(404).json({
                        message: 'Unit not found',
                        status: false,
                    });
                }

                resource.unit_id = unit;
            }

            resource.name = name || resource.name;
            resource.discription = discription || resource.discription;
            resource.size = size || resource.size;

            const updatedResource = await resourceRepository.save(resource);

            return res.status(200).json({
                message: 'Resource updated successfully',
                status: true,
                data: updatedResource,
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

    public async deleteResource(req: CustomRequest, res: Response) {
        try {
            const resourceId = parseInt(req.params.id);
            const resourceRepository = AppDataSource.getRepository(Resource);

            const resource = await resourceRepository.findOne({ where: { resource_id: resourceId } });

            if (!resource) {
                return res.status(404).json({
                    message: 'Resource not found',
                    status: false,
                });
            }

            await resourceRepository.remove(resource);

            return res.status(200).json({
                message: 'Resource deleted successfully',
                status: true,
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
}

export default ResourceController;
