import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { CustomRequest } from "../util/Interface/expressInterface";
import { Course } from "../entity/Course.entity";
import fs from "fs";
import { spawn } from "child_process"
import { Unit } from "../entity/Unit.entity";
import { User } from "../entity/User.entity";
import { Learner } from "../entity/Learner.entity";

class CourseController {

    public async CreateCourse(req: CustomRequest, res: Response) {
        try {
            const { data } = req.body;
            if (!data) {
                return res.status(400).json({
                    message: "please provide a data object",
                    status: false,
                });
            }

            const courseRepository = AppDataSource.getRepository(Course);
            const unitRepository = AppDataSource.getRepository(Unit);
            const obj: any = {
                course_name: data.course_name,
                level: data.level,
                sector: data.sector,
                internal_external: data['internal_external'],
                qualification_type: data['qualification_type'],
                assessment_language: data['assessment_language'],
                recommended_minimum_age: parseInt(data['recommended_minimum_age']),
                total_credits: parseInt(data['total_credits']),
                operational_start_date: new Date(data['operational_start_date']),
                assessment_methods: data['assessment_methods'],
                brand_guidelines: data['brand_guidelines'],
                qualification_status: data['qualification_status'],
                overall_grading_type: data['overall_grading_type'],
                permitted_delivery_types: data['permitted_delivery_types'],
                guided_learning_hours: data['guided_learning_hours'],
                course_code: data['course_code'],
            }
            const course = courseRepository.create(obj);
            const savedCourse: any = await courseRepository.save(course);

            const mandatoryUnits = req.body.data["mandatory_units"]?.map(unit => {
                return {
                    unit_ref: unit["unit_ref"],
                    title: unit["title"],
                    level: unit["level"],
                    glh: unit["glh"],
                    credit_value: unit["credit_value"],
                    status: "Mandatory",
                    course_id: savedCourse.course_id
                }
            });
            const optionalUnits = req.body.data["optional_units"]?.map(unit => {
                return {
                    unit_ref: unit["unit_ref"],
                    title: unit["title"],
                    level: unit["level"],
                    glh: unit["glh"],
                    credit_value: unit["credit_value"],
                    status: "Optional",
                    course_id: savedCourse.course_id
                }
            });

            const savedMandatoryUnits = await unitRepository.insert(mandatoryUnits.map((unitData: any) => ({
                ...unitData,
                courseId: savedCourse.course_id,
            })));

            const savedOptionalUnits = await unitRepository.insert(optionalUnits.map((unitData: any) => ({
                ...unitData,
                courseId: savedCourse.course_id,
            })));

            const fetchedMandatoryUnits = await unitRepository.findByIds(savedMandatoryUnits.identifiers.map((id) => id.unit_id));
            const fetchedOptionalUnits = await unitRepository.findByIds(savedOptionalUnits.identifiers.map((id) => id.unit_id));

            savedCourse.units = [...fetchedMandatoryUnits, ...fetchedOptionalUnits];
            const unitdata = await courseRepository.save(savedCourse);

            res.status(200).json({
                message: "Course created successfully",
                status: true,
                data: unitdata,
            });

        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error.message,
                status: false,
            });
        }
    }

    public async GenerateCourse(req: any, res: any) {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const pdfPath = `temp.pdf`;
        const jsonPath = `temp.json`;

        fs.writeFileSync(pdfPath, req.file.buffer);

        const pythonProcess = spawn('python', ['main.py', pdfPath]);

        pythonProcess.on('exit', (code) => {
            if (code === 0) {

                fs.readFile(jsonPath, 'utf-8', (err, data) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to read JSON file' });
                    }

                    try {
                        const jsonData = JSON.parse(data);

                        res.json({
                            status: true,
                            data: jsonData,
                            message: "Successfully read PDF file"
                        });
                    } catch (parseError) {
                        res.status(500).json({ error: 'Failed to parse JSON data' });
                    }
                });
            } else {
                res.status(500).json({ error: 'Failed to convert PDF to JSON' });
            }

            fs.unlinkSync(pdfPath);
            fs.unlinkSync(jsonPath);
        });
    };

    public async DeleteCourse(req: any, res: any) {
        try {
            const courseId = parseInt(req.params.id, 10);

            if (isNaN(courseId)) {
                return res.status(400).json({
                    message: "Invalid course ID",
                    status: false,
                });
            }

            const courseRepository = AppDataSource.getRepository(Course);
            const unitRepository = AppDataSource.getRepository(Unit);

            const courseToDelete = await courseRepository
                .createQueryBuilder('course')
                .leftJoinAndSelect('course.units', 'units')
                .where('course.course_id = :courseId', { courseId })
                .getOne();


            if (!courseToDelete) {
                return res.status(404).json({
                    message: "Course not found",
                    status: false,
                });
            }
            await unitRepository.remove(courseToDelete.units);

            await courseRepository.remove(courseToDelete);

            res.status(200).json({
                message: "Course and associated units deleted successfully",
                status: true,
            });

        } catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                error: error.message,
                status: false,
            });
        }
    }

    public async updateCourse(req: Request, res: Response): Promise<Response> {
        try {
            const courseId: number = parseInt(req.params.id);

            const courseRepository = AppDataSource.getRepository(Course);
            const existingCourse = await courseRepository.findOne({ where: { course_id: courseId } });

            if (!existingCourse) {
                return res.status(404).json({
                    message: 'Course not found',
                    status: false,
                });
            }
            if ('unit' in req.body) {
                delete req.body.unit;
            }
            courseRepository.merge(existingCourse, req.body);
            const updatedCourse = await courseRepository.save(existingCourse);

            return res.status(200).json({
                message: 'Course updated successfully',
                status: true,
                data: updatedCourse,
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error',
                error: error.message,
                status: false,
            });
        }
    }

    public async addLearnerToCourse(req: Request, res: Response): Promise<Response> {
        try {
            const { learner_id, course_id } = req.body

            const learnerRepository = AppDataSource.getRepository(Learner);
            const courseRepository = AppDataSource.getRepository(Course);

            const learner = await learnerRepository.findOne({ where: { learner_id }, relations: ['courses'] });
            const course = await courseRepository.findOne({ where: { course_id } });

            if (!learner || !course) {
                return res.status(404).json({ message: 'Learner or course not found', status: false });
            }

            learner.courses = [...(learner.courses || []), course];
            await learnerRepository.save(learner);
            return res.status(200).json({ message: 'Learner assigned to course successfully', status: true });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error',
                error: error.message,
                status: false,
            });
        }
    };

    public async getCourse(req: Request, res: Response): Promise<Response> {
        try {
            const course_id = parseInt(req.params.id);

            const courseRepository = AppDataSource.getRepository(Course);

            const course = await courseRepository.findOne({ where: { course_id }, relations: ['learners', 'units'] });

            if (!course) {
                return res.status(404).json({ message: 'Course not found', status: false });
            }

            return res.status(200).json({
                message: "Course get successfully",
                data: course,
                status: true
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error',
                error: error.message,
                status: false,
            });
        }
    }

    public async getAllCourse(req: Request, res: Response): Promise<Response> {
        try {
            const courseRepository = AppDataSource.getRepository(Course);

            const qb = courseRepository.createQueryBuilder("course")
                .leftJoinAndSelect('course.units', 'units')
                .leftJoinAndSelect('course.learners', 'learners')

            if (req.query.keyword) {
                qb.andWhere("(course.course_name ILIKE :keyword)", { keyword: `${req.query.keyword}%` });
            }
            const [course, count] = await qb
                .skip(Number(req.pagination.skip))
                .take(Number(req.pagination.limit))
                .orderBy("course.course_id", "ASC")
                .getManyAndCount();

            return res.status(200).json({
                message: "Course fetched successfully",
                status: true,
                data: course,
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

    public async addTrainerToCourse(req: Request, res: Response): Promise<Response> {
        try {
            const { course_id, trainer_id } = req.body
            const userRepository = AppDataSource.getRepository(User);
            const courseRepository = AppDataSource.getRepository(Course);

            const trainer = await userRepository.findOne({ where: { user_id: trainer_id } });
            const course = await courseRepository.findOne({ where: { course_id }, relations: ['trainer'] });

            if (!trainer || !course) {
                return res.status(404).json({ message: 'Trainer or course not found', status: false });
            }

            if (trainer.role !== 'Trainer') {
                return res.status(403).json({ message: 'User does not have the role Trainer', status: false });
            }

            await courseRepository.save(course);

            return res.status(200).json({ message: 'Trainer assigned to course successfully', status: true });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal Server Error',
                error: error.message,
                status: false,
            });
        }

    }
}

export default CourseController;