import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Unit } from '../entity/Unit.entity';
import { CustomRequest } from '../util/Interface/expressInterface';

class UnitController {
    public async createUnit(req: CustomRequest, res: Response) {
        try {
            const { title, status, course_id, level, GLH, } = req.body;

            if (!title || !status) {
                return res.status(400).json({
                    message: 'All fields are required',
                    status: false,
                });
            }

            const unitRepository = AppDataSource.getRepository(Unit);

            const unit = unitRepository.create({
                title,
                status,
                course_id,
                level,
                GLH
            });

            const savedUnit = await unitRepository.save(unit);

            return res.status(200).json({
                message: 'Unit created successfully',
                status: true,
                data: savedUnit,
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

    public async getUnits(req: Request, res: Response) {
        try {
            const unitRepository = AppDataSource.getRepository(Unit);
            const units = await unitRepository.find();

            return res.status(200).json({
                message: 'Units fetched successfully',
                status: true,
                data: units,
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

    public async getUnit(req: Request, res: Response) {
        try {
            const unit_id = parseInt(req.params.id);
            const unitRepository = AppDataSource.getRepository(Unit);

            const unit = await unitRepository.findOne({ where: { unit_id } });

            if (!unit) {
                return res.status(404).json({
                    message: 'Unit not found',
                    status: false,
                });
            }

            return res.status(200).json({
                message: 'Unit fetched successfully',
                status: true,
                data: unit,
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

    public async updateUnit(req: CustomRequest, res: Response) {
        try {
            const unit_id = parseInt(req.params.id);
            const { title, status, course_id, level, GLH } = req.body;

            const unitRepository = AppDataSource.getRepository(Unit);
            const unit = await unitRepository.findOne({ where: { unit_id } });

            if (!unit) {
                return res.status(404).json({
                    message: 'Unit not found',
                    status: false,
                });
            }

            unit.title = title;
            unit.status = status;
            unit.course_id = course_id;
            unit.level = level;
            unit.GLH = GLH;

            const updatedUnit = await unitRepository.save(unit);

            return res.status(200).json({
                message: 'Unit updated successfully',
                status: true,
                data: updatedUnit,
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

    public async deleteUnit(req: CustomRequest, res: Response) {
        try {
            const unitId = parseInt(req.params.id);
            const unitRepository = AppDataSource.getRepository(Unit);

            const unit = await unitRepository.findOne({ where: { unit_id: unitId } });

            if (!unit) {
                return res.status(404).json({
                    message: 'Unit not found',
                    status: false,
                });
            }

            await unitRepository.remove(unit);

            return res.status(200).json({
                message: 'Unit deleted successfully',
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

export default UnitController;
