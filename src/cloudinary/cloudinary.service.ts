import { Injectable } from '@nestjs/common';
import cloudinary from './cloudinary.config';
import { UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
    async uploadFile(
        file: Express.Multer.File,
        options?: { context?: string; public_id?: string },
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            // Tên file gốc, xử lý tên sạch sẽ
            const originalName = file.originalname;
            const cleanedName = originalName.replace(/\s+/g, '_').replace(/\.[^/.]+$/, '');

            // Tự động xác định loại resource dựa trên mime type
            // Các loại ảnh: image/png, image/jpeg, ...
            // Các file raw: application/pdf, ...
            let resourceType: 'image' | 'raw' = 'image';
            if (
                file.mimetype === 'application/pdf' ||
                file.mimetype === 'application/msword' ||
                file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                // Có thể thêm các loại file raw khác ở đây
            ) {
                resourceType = 'raw';
            }

            // Xác định public_id kèm timestamp cho duy nhất
            const ext = resourceType === 'raw' ? '.pdf' : ''; // bạn có thể mở rộng để lấy đúng đuôi nếu cần
            const finalPublicId = `${Date.now()}_${cleanedName}${ext}`;

            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'doctor-certificates',
                    resource_type: resourceType,
                    type: 'upload',
                    access_mode: 'public', // Đảm bảo file được public
                    context: options?.context,
                    public_id: options?.public_id ?? finalPublicId,
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