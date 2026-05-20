import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from 'cloudinary';
import multer, { type FileFilterCallback } from 'multer';
import { Readable } from 'stream';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Usage example:
// In an Express route, use `upload.single('file')` or `upload.array('files')` to accept the file upload,
// then pass the uploaded file buffer to `uploadToCloudinary`.
//
// Example:
// import express from 'express';
// import { upload, uploadToCloudinary } from './utils/cloudinaryUpload';
//
// const router = express.Router();
// router.post('/upload', upload.single('file'), async (req, res) => {
//   if (!req.file) return res.status(400).send('No file uploaded.');
//   try {
//     const result = await uploadToCloudinary(req.file);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: (error as Error).message });
//   }
// });

export const multerStorage = multer.memoryStorage();

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    if (isImage || isVideo) {
        cb(null, true);
    } else {
        cb(new Error('Only image and video files are allowed.'));
    }
};

export const upload = multer({
    storage: multerStorage,
    limits: {
        fileSize: 30 * 1024 * 1024, // 30 MB limit
    },
    fileFilter,
});

export const uploadToCloudinary = async (file: Express.Multer.File) => {
    if (!file) {
        throw new Error('No file provided for Cloudinary upload.');
    }
    const resource_type = file.mimetype.startsWith('video/') ? 'video' : 'image';
    const uploadOptions: UploadApiOptions = {
        resource_type,
        folder: resource_type === 'video' ? 'videos' : 'images',
        public_id: `${resource_type}_${Date.now()}`,
    };
    if (resource_type === 'video') {
        uploadOptions.transformation = [{ duration: 60 }];
    }
    return new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error('No result from Cloudinary upload.'));
            resolve(result);
        });
        const readable = Readable.from(file.buffer);
        readable.pipe(uploadStream);
    });
};

export const deleteFromCloudinary = async (publicId: string, resource_type: 'image' | 'video' = 'image') => {
    return new Promise<any>((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, { resource_type }, (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error('No result from Cloudinary delete.'));
            resolve(result);
        });
    });
};


