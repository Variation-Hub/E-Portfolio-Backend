import { Multer } from 'multer';
import { Request as ExpressRequest } from 'express';

export interface CustomRequest extends ExpressRequest {
    file: Multer.File,
    token: {
        user_id: string,
        user_name: string,
        email: string,
        role: string
    },
    tokenrole: string
}
