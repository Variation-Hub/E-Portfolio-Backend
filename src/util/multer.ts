import multer from 'multer';
const storage = multer.memoryStorage(); // Use memory storage for simplicity
const upload = multer({ storage: storage });

export const singleFileUpload = (fieldName) => {
    return upload.single(fieldName);
};

export const multipleFileUpload = (fieldName, maxCount) => {
    return upload.array(fieldName, maxCount);
};
