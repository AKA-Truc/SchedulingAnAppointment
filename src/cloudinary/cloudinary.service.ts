import { Injectable } from '@nestjs/common';
import cloudinary from './cloudinary.config';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    async uploadFile(
        file: Express.Multer.File,
        options?: { context?: string; public_id?: string },
    ): Promise<UploadApiResponse> {
        const originalName = file.originalname;
        const cleanedName = originalName.replace(/\s+/g, '_').replace(/\.[^/.]+$/, '');
        const ext = file.originalname.split('.').pop();
        const finalPublicId = `${Date.now()}_${cleanedName}`;

        const base64File = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

        return cloudinary.uploader.upload(base64File, {
            folder: 'doctor-certificates',
            resource_type: 'auto', // 👈 QUAN TRỌNG: để auto
            public_id: options?.public_id ?? finalPublicId,
            use_filename: true,
            unique_filename: false,
            access_mode: 'public',
            context: options?.context,
        });
    }
}
