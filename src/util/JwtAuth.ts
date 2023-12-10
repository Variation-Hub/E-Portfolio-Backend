import jwt from 'jsonwebtoken';

const secret: string = process.env.SECRET_KEY

export const generateToken = (payload): any => {

    return jwt.sign(payload, secret, { expiresIn: '2d' });
};

export const verifyToken = (token: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        await jwt.verify(token, secret, (err: any, decoded: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
}