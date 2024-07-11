import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { CustomRequest } from "../util/Interface/expressInterface";
import { Course } from "../entity/Course.entity";
import fs from "fs";
import { spawn } from "child_process"
import { User } from "../entity/User.entity";
import { Learner } from "../entity/Learner.entity";
import { SendNotification } from "../util/socket/notification";
import { UserCourse } from "../entity/UserCourse.entity";
import { userActive } from "../util/helper";
import { SocketDomain } from "../util/constants";
class CourseController {

    public async CreateCourse(req: CustomRequest, res: Response) {
        try {
            const data = req.body;
            if (!data) {
                return res.status(400).json({
                    message: "please provide a data object",
                    status: false,
                });
            }

            const courseRepository = AppDataSource.getRepository(Course);

            const obj: any = {
                course_name: data.course_name,
                level: data.level,
                sector: data.sector,
                qualification_type: data['qualification_type'],
                recommended_minimum_age: parseInt(data['recommended_minimum_age']),
                total_credits: parseInt(data['total_credits']),
                operational_start_date: new Date(data['operational_start_date']),
                brand_guidelines: data['brand_guidelines'],
                qualification_status: data['qualification_status'],
                overall_grading_type: data['overall_grading_type'],
                // permitted_delivery_types: data['permitted_delivery_types'],
                guided_learning_hours: data['guided_learning_hours'],
                course_code: data['course_code'],
                units: data['units'],
            }
            const course = courseRepository.create(obj);
            const savedCourse: any = await courseRepository.save(course);

            res.status(200).json({
                message: "Course created successfully",
                status: true,
                data: savedCourse,
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

        const pythonProcess = spawn('python3', ['main.py', pdfPath]);

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

            const courseToDelete = await courseRepository.findOne({
                where: { course_id: courseId },
                relations: ['resources'],
            });

            if (!courseToDelete) {
                return res.status(404).json({
                    message: "Course not found",
                    status: false,
                });
            }

            await courseRepository.remove(courseToDelete);

            res.status(200).json({
                message: "Course deleted successfully",
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

    public async courseEnrollment(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { learner_id, course_id, trainer_id, IQA_id, LIQA_id, EQA_id, employer_id } = req.body

            const learnerRepository = AppDataSource.getRepository(Learner);
            const courseRepository = AppDataSource.getRepository(Course);
            const userCourseRepository = AppDataSource.getRepository(UserCourse);

            const course = await courseRepository.findOne({ where: { course_id } });
            const learner = await learnerRepository.findOne({ where: { learner_id }, relations: ['user_id'] });
            if (!course || !learner) {
                return res.status(404).json({ message: 'course or learner not found', status: false });
            }

            delete course.created_at, course.updated_at
            const courseData = {
                ...course,
                units: course.units.map(unit => {
                    return {
                        ...unit,
                        completed: false
                    }
                })

            }
            await userCourseRepository.create({ learner_id, trainer_id, IQA_id, LIQA_id, EQA_id, employer_id, course: courseData })

            const userRepository = AppDataSource.getRepository(User);
            const admin = await userRepository.findOne({ where: { user_id: req.user.user_id } });
            const data = { title: "Course Allocation", message: `${admin.first_name + " " + admin.last_name} assigned you a ${course.course_name} course.`, domain: SocketDomain.CourseAllocation }
            SendNotification(learner.user_id.user_id, data)
            res.status(200).json({ message: 'Learner assigned to course successfully', status: true });

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

            const course = await courseRepository.findOne({ where: { course_id } });

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

            if (req.query.keyword) {
                qb.andWhere("(course.course_name ILIKE :keyword)", { keyword: `%${req.query.keyword}%` });
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

}

export default CourseController;