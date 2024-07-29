import { SendEmailTemplet } from "./nodemailer";

export const sendPasswordByEmail = async (email: string, password: any): Promise<boolean> => {
    try {
        const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f0f0f0;
                    margin: 0;
                    padding: 0;
                    text-align: center;
                }
        
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
        
                .logo {
                    max-width: 150px;
                    height: auto;
                    margin-bottom: 20px;
                }
        
                .title {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #333;
                }
        
                .message {
                    font-size: 16px;
                    margin-bottom: 20px;
                    color: #555;
                }
        
                .password {
                    font-weight: bold;
                    font-size: 20px;
                    color: #3498db;
                }
        
                .footer {
                    font-size: 16px;
                    color: #777;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Add your logo here -->
                <img class="logo" src="https://jeel1.s3.ap-south-1.amazonaws.com/logo/logo.svg" alt="Locker Logo">
        
                <div class="title">Welcome to Locker</div>
                <div class="message">
                    <p>Congratulations! Your account has been successfully created.</p>
                </div>
                <div class="password">Your temporary password is: <strong>${password}</strong></div>
                <div class="footer">
                    <p>Thank you for using Locker.</p>
                </div>
            </div>
        </body>
        </html>
        `

        const responce = await SendEmailTemplet(email, "Welcome", null, html)
        return true
    } catch (error) {
        console.log(error)
        return true
    }
}

const generateOTP = (): string => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};

export const sendOtpByEmail = async (email: string): Promise<any> => {
    const otp = generateOTP();

    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background-color: #f0f0f0;
                margin: 0;
                padding: 0;
                text-align: center;
            }
    
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
    
            .logo {
                max-width: 150px;
                height: auto;
                margin-bottom: 20px;
            }
    
            .title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #333;
            }
    
            .message {
                font-size: 16px;
                margin-bottom: 20px;
                color: #555;
            }
    
            .otp {
                font-weight: bold;
                font-size: 32px;
                color: #3498db;
            }
    
            .footer {
                font-size: 16px;
                color: #777;
            }
        </style>
    </head>
    <body>
        <div class="container">
        <img class="adapt-img" src="https://jeel1.s3.ap-south-1.amazonaws.com/logo/logo.svg" alt style="display: block;" width="180">
            <div class="title">One-Time Password</div>
            <div class="message">
                <p>You are receiving this email because a request has been made to reset the password for your Locker account.</p>
            </div>
            <div class="otp"><strong>${otp}</strong></div>
            <div class="footer">
                <p>If you did not request a password reset or have any concerns, please ignore this email.</p>
                <p>Thank you for using Locker.</p>
            </div>
        </div>
    </body>
    </html> `;

    const response = await SendEmailTemplet(email, "Locker - One-Time Password for Your Account", null, html);

    return otp;
};
