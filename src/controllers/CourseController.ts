import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Learner } from "../entity/Learner.entity";
import { IUser, User } from "../entity/User.entity";
import { bcryptpassword } from "../util/bcrypt";
import { sendPasswordByEmail } from "../util/mailSend";
import { CustomRequest } from "../util/Interface/expressInterface";
import { Course } from "../entity/Course.entity";
import fs from "fs";
import { spawn } from "child_process"

class CourseController {

    public async CreateCourse(req: CustomRequest, res: Response) {
        try {
            const { name, course_code, level, description, units } = req.body;
            if (!name || !course_code || !level || !description) {
                return res.status(400).json({
                    message: "All fields are required",
                    status: false,
                });
            }

            const courseRepository = AppDataSource.getRepository(Course)

            const course = await courseRepository.create(req.body);

            const saveCourse: any = await courseRepository.save(course);
            res.status(200).json({
                message: "COurse create successfully",
                status: true,
                data: saveCourse
            })

        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error.message,
                status: false
            })
        }
    }

    public async GenerateCourse(req: any, res: any) {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Save the uploaded PDF file temporarily in the current module's directory
        const pdfPath = `temp.pdf`;
        const jsonPath = `temp.json`;

        console.log(pdfPath, jsonPath)
        fs.writeFileSync(pdfPath, req.file.buffer);

        // Run the Python script
        const pythonProcess = spawn('python3', ['main.py', pdfPath]);

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
}

export default CourseController;