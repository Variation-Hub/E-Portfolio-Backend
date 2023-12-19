import { SendEmailTemplet } from "./nodemailer";

export const sendPasswordByEmail = async (email: string, password: any): Promise<boolean> => {
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
            <div class="title">Account Created</div>
            <div class="message">
                <p>Hello,</p>
                <p>You are receiving this email because an account has been created for your Locker account.</p>
            </div>
            <div class="password">Your temporary password is: <strong>${password}</strong></div>
            <div class="footer">
                <p>Thank you for using Locker.</p>
            </div>
        </div>
    </body>
    </html>`

    const responce = await SendEmailTemplet(email, "Welcome to Locker - Your New Account Has Been Created!", null, html)
    return true
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
            <div class="title">One-Time Password</div>
            <div class="message">
                <p>Hello,</p>
                <p>You are receiving this email because an account has been created for your Locker account.</p>
            </div>
            <div class="otp">Your one-time password is: <strong>${otp}</strong></div>
            <div class="footer">
                <p>Thank you for using Locker.</p>
            </div>
        </div>
    </body>
    </html>`;

    const response = await SendEmailTemplet(email, "Locker - One-Time Password for Your Account", null, html);

    return otp;
};
