import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from "express";
import { UserRole } from '../util/enum/user_enum';

const secret: string = process.env.SECRET_KEY

interface CustomRequest extends Request {
    role?: string;
  }
export const verifyTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const BearerToken: string | undefined = req.header('authorization');

    if (BearerToken) {

        const tokenResult: any = jwt.verify(BearerToken.slice(7), secret, (err: any, decoded: any) => {
            if (err) {
                return null;
            } else {
                return decoded;
            }
        });

        if (!tokenResult) {
            return res.status(552).json({
                message: "Invalide token",
                status: false
            });
        }

        const currentUnixTime = Math.floor(Date.now() / 1000);
        const { exp } = tokenResult;

        if (currentUnixTime > exp) {
            return res.status(552).json({
                message: "Token expired",
                status: false
            });
        }

        if (tokenResult.role !== UserRole.Admin) {
            return res.status(552).json({
                message: "Admin Token required",
                status: false
            });
        }

    }

    else {
        return res.status(552).json({
            message: "Unauthorized",
            status: false
        });
    }

    next();
};

export const verifyAdminTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const BearerToken: string | undefined = req.header('authorization');

    if (BearerToken) {

        const tokenResult: any = jwt.verify(BearerToken.slice(7), secret, (err: any, decoded: any) => {
            if (err) {
                return null;
            } else {
                return decoded;
            }
        });
        
        if (!tokenResult || tokenResult.role !==  UserRole.Admin) {
            return res.status(552).json({
                message: "Invalide token",
                status: false
            });
        }

        const currentUnixTime = Math.floor(Date.now() / 1000);
        const { exp } = tokenResult;

        if (currentUnixTime > exp) {
            return res.status(552).json({
                message: "Token expired",
                status: false
            });
        }

    }

    else {
        return res.status(552).json({
            message: "Unauthorized",
            status: false
        });
    }

    next();
};

export const checkRoleTokenMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
    const BearerToken: string | undefined = req.header('authorization');

    if (BearerToken) {

        const tokenResult: any = jwt.verify(BearerToken.slice(7), secret, (err: any, decoded: any) => {
            if (err) {
                return null;
            } else {
                return decoded;
            }
        });
        
        if (!tokenResult ) {
            return res.status(552).json({
                message: "Invalide token",
                status: false
            });
        }

        const currentUnixTime = Math.floor(Date.now() / 1000);
        const { exp } = tokenResult;

        if (currentUnixTime > exp) {
            return res.status(552).json({
                message: "Token expired",
                status: false
            });
        }

        req.role = tokenResult.role
    }

    else {
        return res.status(552).json({
            message: "Unauthorized",
            status: false
        });
    }
    next();
};

// export const authorizeRoles = (...roles: string[]) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//       if (!req.user) {
//         return res.status(403).json({ status: false, message: 'User not authorized' });
//       }
  
//       const userRole: string | null = req.user.role;
  
//       if (!userRole || !roles.includes(userRole)) {
//         return res.status(403).json({ status: false, message: `Role: ${userRole} is not allowed to access this resource` });
//       }
  
//       next();
//     };
//   };