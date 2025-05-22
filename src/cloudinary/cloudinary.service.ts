import { Injectable } from '@nestjs/common';
import cloudinary from './cloudinary.config'; // import cấu hình Cloudinary đã setup sẵn
import { UploadApiResponse } from 'cloudinary'; // kiểu trả về của API upload Cloudinary
import { Readable } from 'stream'; // module Node.js dùng để tạo luồng dữ liệu (stream)

@Injectable()
export class CloudinaryService {
    async uploadFile(
        file: Express.Multer.File,
        options?: { context?: string; public_id?: string },
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'doctor-certificates',
                    resource_type: 'auto',
                    context: options?.context,          // gắn metadata
                    public_id: options?.public_id,      // tùy chỉnh tên file nếu cần
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error('Upload failed: no result returned'));
                    resolve(result);
                },
            );
            Readable.from(file.buffer).pipe(stream);
        });
    }

}