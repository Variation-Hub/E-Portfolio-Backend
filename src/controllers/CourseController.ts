import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { CustomRequest } from "../util/Interface/expressInterface";
import { Course } from "../entity/Course.entity";
import fs from "fs";
import { spawn } from "child_process"
import { Unit } from "../entity/Unit.entity";

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
                title: data.title,
                level: data.Level,
                sector: data.Sector,
                internal_external: data['Internal/External'],
                qualification_type: data['Qualification Type'],
                assessment_language: data['Assessment Language'],
                recommended_minimum_age: parseInt(data['Recommended Minimum Age']),
                total_credits: parseInt(data['Total Credits']),
                operational_start_date: new Date(data['Operational Start Date']),
                assessment_methods: data['Assessment Methods'],
                brand_guidelines: data['Brand Guidelines'],
            }
            const course = courseRepository.create(obj);
            const savedCourse: any = await courseRepository.save(course);

            const mandatoryUnits = req.body.data["Mandatory units"]?.map(unit => {
                return {
                    unit_ref: unit["Unit ref."],
                    title: unit["Title"],
                    level: unit["Level"],
                    GLH: unit["GLH"],
                    credit_value: unit["Credit Value"],
                    status: "Mandatory",
                    course_id: savedCourse.course_id
                }
            });
            const optionalUnits = req.body.data["Optional units"]?.map(unit => {
                return {
                    unit_ref: unit["Unit ref."],
                    title: unit["Title"],
                    level: unit["Level"],
                    GLH: unit["GLH"],
                    credit_value: unit["Credit Value"],
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

        // Save the uploaded PDF file temporarily in the current module's directory
        const pdfPath = `temp.pdf`;
        const jsonPath = `temp.json`;

        fs.writeFileSync(pdfPath, req.file.buffer);

        // Run the Python script
        const pythonProcess = spawn('python', ['main.py', pdfPath]);

        pythonProcess.on('exit', (code) => {
            if (code === 0) {

                // Read the JSON file
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

}

export default CourseController;