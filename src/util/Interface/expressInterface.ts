import { Multer } from 'multer';
import { Request as ExpressRequest } from 'express';

export interface CustomRequest extends ExpressRequest {
    file: Multer.File;
}
