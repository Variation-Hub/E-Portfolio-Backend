import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { sendOtpByEmail } from "../util/mailSend";
import { Otp } from "../entity/Otp.entity";
import { isOtpExpired } from "../util/otpValid";

class OtpController {

    public async sendOTP(req: Request, res: Response) {
        try {
            const otpRepository = AppDataSource.getRepository(Otp)

            const { email } = req.body
            if (!email) {
                return res.status(400).json({
                    message: "email Field Required",
                    status: false
                })
            }

            const sendmail = await sendOtpByEmail(email)

            if (!sendmail) {
                return res.status(532).json({
                    message: "failed to send email",
                    status: false
                })
            }

            const existingOtp = await otpRepository.findOne({ where: { email } });

            if (existingOtp) {
                existingOtp.otp = sendmail;
                await otpRepository.save(existingOtp);
            } else {
                const otp = await otpRepository.create({ email, otp: sendmail });
                await otpRepository.save(otp);
            }

            return res.status(200).json({
                message: "OTP send successfully",
                status: true
            })

        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                status: false
            })
        }
    }

    public async validateOTP(req: Request, res: Response) {
        try {
            const otpRepository = AppDataSource.getRepository(Otp)

            const { email, otp } = req.body
            if (!email || !otp) {
                return res.status(400).json({
                    message: "email and otp field required",
                    status: false
                })
            }

            const storeOtp = await otpRepository.findOne({ where: { email } });

            if (!storeOtp) {
                return res.status(404).json({
                    message: "OTP not found",
                    statotpus: false
                })
            }

            if (otp !== storeOtp.otp) {
                return res.status(402).json({
                    message: "OTP invalid",
                    statotpus: false
                })
            }

            const expired = isOtpExpired(storeOtp.updated_at)
            if (expired) {
                return res.status(402).json({
                    message: "OTP expired",
                    statotpus: false
                })
            }

            return res.status(200).json({
                message: "Valid OTP",
                status: true
            })


        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                status: false
            })
        }
    }
}

export default OtpController;